import { Codacyrc, Pattern, Tool } from "codacy-seed";
import assert, { deepStrictEqual } from "node:assert";
import { extractFiles, extractPatternIdsToApply } from "../configExtractor"

describe("configCreator", () => {
  it("should be able to retrive files", async () => {

    const filename1: string = "filename1.json"
    const filename2: string = "filename2.yaml"

    const codacyrc = new Codacyrc([filename1, filename2]);
  
    const files = await extractFiles(codacyrc)

    const expectedFiles: String[] = [filename1, filename2]

    deepStrictEqual(files, expectedFiles)
  })
  it("should return empty files", async () => {

    const codacyrc = new Codacyrc([]);
  
    const files = await extractFiles(codacyrc)

    assert(!files.length)
  })
  it("should be able to retrieve patternIds", async () => {

    const patternId1: string = "pattern Id 1"
    const patternId2: string = "pattern Id 2"

    const patterns: Pattern[] = [new Pattern(patternId1), new Pattern(patternId2)]
    const tools: Tool[] = [new Tool("spectral", patterns)]

    const expectedPatternIds: String[] = [patternId1, patternId2]

    const codacyrc = new Codacyrc([], tools);
  
    const patternIds = await extractPatternIdsToApply(codacyrc)

    deepStrictEqual(expectedPatternIds, patternIds)
  })
  it("should return empty patternIds", async () => {

    const tools: Tool[] = [new Tool("spectral")]

    const codacyrc = new Codacyrc([], tools);
  
    const patternIds = await extractPatternIdsToApply(codacyrc)

    assert(!patternIds?.length)
  })
})
