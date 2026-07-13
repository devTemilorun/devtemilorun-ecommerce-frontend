export function parseProductImages(images: unknown): string[] {
  let result: unknown = images

  for (let i = 0; i < 2; i++) {
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result)
      } catch {
        break
      }
    } else {
      break
    }
  }

  if (typeof result === 'string') {
    result = [result]
  }

  if (!Array.isArray(result)) {
    return []
  }

  return result.filter((img): img is string => {
    if (!img || typeof img !== 'string') return false
    const trimmed = img.trim()
    if (trimmed === '') return false
    return trimmed.startsWith('http') || trimmed.startsWith('/')
  })
}