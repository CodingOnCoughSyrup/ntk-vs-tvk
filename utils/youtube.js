export function getYouTubeId(url = '') {
  try {
    if (!url) return null;
    // Handle youtu.be/<id>
    const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    if (short) return short[1];

    // Handle watch?v=<id>
    const vParam = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    if (vParam) return vParam[1];

    // Handle embed/<id>
    const embed = url.match(/embed\/([A-Za-z0-9_-]{6,})/);
    if (embed) return embed[1];

    return null;
  } catch {
    return null;
  }
}

export function getThumbUrl(ytUrl = '') {
  const id = getYouTubeId(ytUrl);
  if (!id) return null;
  // Prefer maxres, fall back to hqdefault via onError in <img>
  return {
    max: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    hq:  `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    id
  };
}
