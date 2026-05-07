export function getSaveErrorToast(result, name, fallbackMessage = "Failed to save.") {
  const trimmedName = name.trim();

  if (result.reason === "empty-name") {
    return { message: "Please enter a segment name.", type: "warning" };
  }

  if (result.reason === "no-tabs") {
    return { message: "No saveable tabs found.", type: "warning" };
  }

  if (result.reason === "duplicate") {
    return { message: `"${trimmedName}" already exists.`, type: "warning" };
  }

  if (result.reason === "quota") {
    return { message: "Storage full! Export & remove old segments.", type: "error" };
  }

  return { message: fallbackMessage, type: "error" };
}
