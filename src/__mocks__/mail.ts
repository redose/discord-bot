export default async function createMail() {
  return {
    close: jest.fn().mockResolvedValue(undefined),
    send: {
      verify: jest.fn().mockResolvedValue(undefined),
    },
  };
}
