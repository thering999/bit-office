export async function fetchApiData(url: string, method: string = "GET", headers: string = "{}", apiKey: string = "") {
  try {
    const headerObj = JSON.parse(headers || "{}");
    if (apiKey) {
      headerObj["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headerObj,
      },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API Fetch Error:", err);
    return null;
  }
}
