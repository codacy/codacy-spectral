import assert, { deepStrictEqual } from "assert";
import { Codacyrc, Pattern, Tool } from "codacy-seed";

import { extractFiles, extractPatternIdsToApply } from "../configExtractor"

describe("configExtractor", () => {
  it("should be able to retrieve files", async () => {
    const filename1: string = "filename1.json"
    const filename2: string = "filename2.yaml"
    const codacyrc = new Codacyrc([filename1, filename2]);

    const files = await extractFiles(codacyrc)

    const expectedFiles: string[] = [filename1, filename2]

    deepStrictEqual(files, expectedFiles)
  })

  it("should be able to retrieve patternIds", async () => {
    const patternId1: string = "pattern Id 1"
    const patternId2: string = "pattern Id 2"
    const patterns: Pattern[] = [new Pattern(patternId1), new Pattern(patternId2)]
    const tools: Tool[] = [new Tool("spectral", patterns)]
    const codacyrc = new Codacyrc([], tools);

    const expectedPatternIds: string[] = [patternId1, patternId2]

    const patternIds = await extractPatternIdsToApply(codacyrc)

    deepStrictEqual(expectedPatternIds, patternIds)
  })
  it("should return empty files", async () => {
    const tools: Tool[] = [new Tool("spectral")]
    const codacyrc = new Codacyrc([], tools);

    const files = await extractFiles(codacyrc)

    console.log(files)

    assert(!files?.length)
  })

  it("should return empty patternIds", async () => {
    const tools: Tool[] = [new Tool("spectral")]
    const codacyrc = new Codacyrc([], tools);

    const patternIds = await extractPatternIdsToApply(codacyrc)

    assert(!patternIds?.length)
  })
  it("should return empty patternIds when no tools are present", async () => {
    const codacyrc = new Codacyrc([], []);

    const patternIds = await extractPatternIdsToApply(codacyrc)

    assert(!patternIds?.length)
  })
})
