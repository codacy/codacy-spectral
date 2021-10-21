import packageJson from "../package.json"

export const toolName = "spectral"

export const toolVersion = packageJson.dependencies["@stoplight/spectral-core"].replace("^", "")
