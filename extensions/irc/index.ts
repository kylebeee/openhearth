import type { ChannelPlugin, OpenHearthPluginApi } from "openhearth/plugin-sdk";
import { emptyPluginConfigSchema } from "openhearth/plugin-sdk";
import { ircPlugin } from "./src/channel.js";
import { setIrcRuntime } from "./src/runtime.js";

const plugin = {
  id: "irc",
  name: "IRC",
  description: "IRC channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenHearthPluginApi) {
    setIrcRuntime(api.runtime);
    api.registerChannel({ plugin: ircPlugin as ChannelPlugin });
  },
};

export default plugin;
