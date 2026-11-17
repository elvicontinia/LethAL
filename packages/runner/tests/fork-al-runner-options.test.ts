// Fork: `alRunnerV3.extraArgs` and `alRunnerV3.allowUngated`, and the Windows platform check.
import { describe, expect, test } from "bun:test";
import { AL_RUNNER_V3_VERSION, firstLine, v3CallArgv } from "../src/al-runner-v3-backend";
import { refuseV3Platform, validateAlRunnerV3Config } from "../src/al-runner-v3-config";

const base = { packagesDir: "/p", bcVersion: "28.0.46665.47126" };

describe("fork: extraArgs", () => {
  test("a list of flags is kept as written; absent is an empty list", () => {
    const args = ["--allow-network", "--skip-partner-login"];
    expect(validateAlRunnerV3Config({ ...base, extraArgs: args }).extraArgs).toEqual(args);
    expect(validateAlRunnerV3Config(base).extraArgs).toEqual([]);
  });
  test("anything but a list of non-empty strings is refused by name", () => {
    for (const bad of ["--allow-network", [""], [3], true])
      expect(() => validateAlRunnerV3Config({ ...base, extraArgs: bad })).toThrow(
        '"alRunnerV3.extraArgs" must be a list of non-empty strings',
      );
  });
  test("v3CallArgv puts the flags before the two app folders", () => {
    const argv = v3CallArgv({
      alRunnerPath: "/b",
      codeunitId: 7,
      stopSeconds: 3,
      packagesDir: "/d",
      bcVersion: "28.0.1.2",
      symbols: [],
      activeDir: "/a",
      testDir: "/t",
      extraArgs: ["--allow-network", "--dotnet-assembly-dir", "/n"],
    });
    expect(argv.slice(-5)).toEqual(["--allow-network", "--dotnet-assembly-dir", "/n", "/a", "/t"]);
  });
});

describe("fork: allowUngated", () => {
  test("defaults to false; a boolean is kept; anything else is refused by name", () => {
    expect(validateAlRunnerV3Config(base).allowUngated).toBe(false);
    expect(validateAlRunnerV3Config({ ...base, allowUngated: true }).allowUngated).toBe(true);
    expect(() => validateAlRunnerV3Config({ ...base, allowUngated: "yes" })).toThrow(
      '"alRunnerV3.allowUngated" must be a boolean',
    );
  });
});

describe("fork: --version with a note after it", () => {
  test("only the first line is the version", () => {
    const out =
      "al-runner 3.0.0-alpha.14 (4852ecc16)\r\nalso on PATH: C:\\shims\\al-runner.exe: (no answer within 2 s)\r\n";
    expect(firstLine(out)).toBe("al-runner 3.0.0-alpha.14 (4852ecc16)");
    expect(AL_RUNNER_V3_VERSION.test(firstLine(out))).toBe(true);
  });
});

describe("fork: platform", () => {
  test("Windows runs", () => {
    expect(() => refuseV3Platform("win32")).not.toThrow();
  });
});
