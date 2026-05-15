const { spawn } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const roomRepository = require("../rooms/room.repository");
const { AppError, NotFoundError } = require("../../util/errors");

const EXECUTION_TIMEOUT_MS = 5000;
const MAX_OUTPUT_BYTES = 64 * 1024;

const runners = {
  javascript: {
    file: "main.js",
    steps: [{ command: "node", args: ["main.js"], type: "run" }],
  },
  typescript: {
    file: "main.js",
    steps: [{ command: "node", args: ["main.js"], type: "run" }],
  },
  python: {
    file: "main.py",
    steps: [
      { command: "python3", args: ["main.py"], type: "run", fallback: true },
      { command: "python", args: ["main.py"], type: "run" },
    ],
  },
  go: {
    file: "main.go",
    steps: [{ command: "go", args: ["run", "main.go"], type: "run" }],
  },
  java: {
    file: "Main.java",
    steps: [
      { command: "javac", args: ["Main.java"], type: "compile" },
      { command: "java", args: ["Main"], type: "run" },
    ],
  },
  cpp: {
    file: "main.cpp",
    steps: [
      {
        command: "g++",
        args: ["main.cpp", "-std=c++17", "-O2", "-pipe", "-o", "main"],
        type: "compile",
      },
      { command: "./main", args: [], type: "run" },
    ],
  },
  rust: {
    file: "main.rs",
    steps: [
      { command: "rustc", args: ["main.rs", "-O", "-o", "main"], type: "compile" },
      { command: "./main", args: [], type: "run" },
    ],
  },
};

const normalizeRoomId = (roomId) => roomId.toUpperCase();

const isActiveParticipant = (room, userId) => {
  return room.participants.some((participant) => {
    return (
      participant.user.toString() === userId.toString() &&
      participant.status === "active"
    );
  });
};

const trimOutput = (value) => {
  const buffer = Buffer.from(value || "", "utf8");
  if (buffer.length <= MAX_OUTPUT_BYTES) return value || "";

  return `${buffer.subarray(0, MAX_OUTPUT_BYTES).toString("utf8")}\n... output truncated`;
};

const runProcess = (step, cwd, stdin) => {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(step.command, step.args, {
      cwd,
      env: {
        PATH: process.env.PATH,
        HOME: os.tmpdir(),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, EXECUTION_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout = trimOutput(stdout + chunk.toString("utf8"));
    });

    child.stderr.on("data", (chunk) => {
      stderr = trimOutput(stderr + chunk.toString("utf8"));
    });

    child.stdin.on("error", () => {});

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        step: step.type,
        exitCode: null,
        stdout,
        stderr:
          error.code === "ENOENT"
            ? `${step.command} is not installed on this server`
            : error.message,
        timedOut: false,
        missingRuntime: error.code === "ENOENT",
        durationMs: Date.now() - startedAt,
      });
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        step: step.type,
        exitCode,
        stdout,
        stderr: timedOut
          ? trimOutput(`${stderr}\nExecution timed out after 5 seconds`.trim())
          : stderr,
        timedOut,
        missingRuntime: false,
        durationMs: Date.now() - startedAt,
      });
    });

    if (stdin) {
      child.stdin.write(stdin);
    }

    child.stdin.end();
  });
};

const executeSteps = async (runner, cwd, stdin) => {
  let previousMissingFallback = null;
  let lastResult = null;

  for (const step of runner.steps) {
    const result = await runProcess(step, cwd, stdin);

    if (result.missingRuntime && step.fallback) {
      previousMissingFallback = result;
      continue;
    }

    if (previousMissingFallback && result.missingRuntime) {
      result.stderr = `${previousMissingFallback.stderr}\n${result.stderr}`;
    }

    if (result.exitCode !== 0 || result.timedOut || result.missingRuntime) {
      return result;
    }

    lastResult = result;
  }

  return lastResult;
};

const ensureExecutableRoom = async (roomId, user) => {
  const room = await roomRepository.findByIdOrCode(roomId);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  if (!isActiveParticipant(room, user._id)) {
    throw new AppError("Join the room before running code", 403, "ROOM_ACCESS_REQUIRED");
  }

  return room;
};

const runCode = async (roomId, payload, user) => {
  const runner = runners[payload.language];

  if (!runner) {
    throw new AppError("Unsupported execution language", 400, "UNSUPPORTED_LANGUAGE");
  }

  const room = await ensureExecutableRoom(roomId, user);
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "pairloop-run-"));

  try {
    await fs.writeFile(path.join(workdir, runner.file), payload.code || "", "utf8");
    const result = await executeSteps(runner, workdir, payload.stdin || "");

    return {
      execution: {
        roomId: normalizeRoomId(room.code),
        language: payload.language,
        status: result.exitCode === 0 && !result.timedOut ? "completed" : "failed",
        step: result.step,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        timedOut: result.timedOut,
        durationMs: result.durationMs,
      },
    };
  } finally {
    await fs.rm(workdir, { recursive: true, force: true });
  }
};

module.exports = {
  runCode,
};
