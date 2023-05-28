import {
  Client,
  ClientOptions,
  CommandInteraction,
  User,
} from 'discord.js';

export default async function createMockDiscordClient() {
  return class MockDiscordClient {
    client!: Client;
    user!: User;
    interaction!: CommandInteraction;
    #options?: ClientOptions;

    constructor(options?: ClientOptions) {
      this.#options = options;
      this.#mockClient();
      this.#mockUser();
      this.#mockInteractions();
    }

    getInteractions(): CommandInteraction {
      return this.interaction;
    }

    #mockClient() {
      this.client = new Client({ intents: [] });
      this.client.login = jest.fn(() => Promise.resolve('MOCK_LOGIN_TOKEN'));
    }

    #mockUser() {
      this.user = Reflect.construct(User, [
        this.client,
        {
          id: 'mockUserId',
          username: 'mockUsername',
          discriminator: 'mockDiscriminator#0001',
          avatar: 'mockUserAvatar.png',
          bot: false,
        },
      ]);
    }

    #mockInteractions() {
      this.interaction = Reflect.construct(CommandInteraction, [
        this.client,
        {
          data: this.#options,
          id: BigInt(1),
          user: this.user,
        },
      ]);
      this.interaction.reply = jest.fn();
      this.interaction.isCommand = jest.fn(() => true);
    }
  };
}
