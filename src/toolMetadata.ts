import packageJson from "../package.json"

export const toolName = "markdownlint"

export const toolVersion = packageJson.dependencies["@stoplight/spectral-core"].replace("^", "")
