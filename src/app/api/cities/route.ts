import fs from "node:fs";
import path from "node:path";

type WorldCity = { name: string; country: string; population: number };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (query.length < 2) {
    return Response.json([]);
  }

  const filePath = path.join(process.cwd(), "public", "cities.json");
  const cities = JSON.parse(fs.readFileSync(filePath, "utf8")) as WorldCity[];

  const matches = cities
    .filter((city) => city.name.toLowerCase().includes(query))
    .sort((a, b) => b.population - a.population)
    .slice(0, 50);

  const uniqueNames = Array.from(new Map(matches.map((city) => [city.name, city])).values());

  return Response.json(uniqueNames.map((city) => ({
    name: city.name,
    countryCode: city.country,
  })));
}
