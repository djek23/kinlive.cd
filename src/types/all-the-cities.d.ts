declare module "all-the-cities" {
  export interface WorldCity {
    name: string;
    country: string;
    population: number;
  }

  const cities: WorldCity[];
  export default cities;
}
