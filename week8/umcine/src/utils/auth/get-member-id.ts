export function getMemberId(accessToken: string | null): number | null {
  if (!accessToken) {
    return null;
  }

  try {
    const payload = accessToken.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(atob(base64));

    const memberId = Number(decoded.sub);

    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      return null;
    }

    return memberId;
  } catch {
    return null;
  }
}