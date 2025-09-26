import { connectTestDB, disconnectTestDB, clearDatabase } from "./setup";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectTestDB();
});
