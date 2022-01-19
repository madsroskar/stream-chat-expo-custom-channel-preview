/* eslint-disable react/display-name */
import "react-native-gesture-handler";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { LogBox, Text, TouchableOpacity, View } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StreamChat } from "stream-chat";
import {
  ChannelList,
  Chat,
  OverlayProvider,
  Streami18n,
} from "stream-chat-expo";

import { useStreamChatTheme } from "./useStreamChatTheme";

LogBox.ignoreAllLogs(true);

/**
 * 📣 Change here to use your configuration from https://getstream.io/dashboard
 * */
const API_KEY = "YOUR_API_KEY";
const USER_ID = "YOUR_USER_ID";
const USER_TOKEN = "YOUR_USER_TOKEN";

const chatClient = StreamChat.getInstance(API_KEY);
const userToken = USER_TOKEN;
const user = {
  id: USER_ID,
};

const filters = {
  members: { $in: [USER_ID] },
  type: "messaging",
};
const sort = { last_message_at: -1 };
const options = {
  state: true,
  watch: true,
};

/**
 * Start playing with streami18n instance here:
 * Please refer to description of this PR for details: https://github.com/GetStream/stream-chat-react-native/pull/150
 */
const streami18n = new Streami18n({
  language: "en",
});

const ChannelListScreen = ({ navigation }) => {
  const { setChannel } = useContext(AppContext);

  const memoizedFilters = useMemo(() => filters, []);

  return (
    <Chat client={chatClient} i18nInstance={streami18n}>
      <View style={{ height: "100%" }}>
        <ChannelList
          filters={memoizedFilters}
          onSelect={(channel) => {
            setChannel(channel);
            navigation.navigate("Channel");
          }}
          options={options}
          Preview={({ channel }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  console.log(channel.id);
                }}
              >
                <View
                  style={{
                    height: 50,
                    width: "100%",
                    borderTopColor: "#cccccc",
                    borderTopWidth: 1,
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <Text style={{ paddingLeft: 10 }}>{channel.data.name}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          sort={sort}
        />
      </View>
    </Chat>
  );
};

const AppContext = React.createContext();

const App = () => {
  const { bottom } = useSafeAreaInsets();
  const theme = useStreamChatTheme();

  const [channel, setChannel] = useState();
  const [clientReady, setClientReady] = useState(false);
  const [thread, setThread] = useState();

  useEffect(() => {
    const setupClient = async () => {
      await chatClient.connectUser(user, userToken);

      setClientReady(true);
    };

    setupClient();
  }, []);

  return (
    <AppContext.Provider value={{ channel, setChannel, setThread, thread }}>
      <OverlayProvider
        bottomInset={bottom}
        i18nInstance={streami18n}
        translucentStatusBar
        value={{ style: theme }}
      >
        {clientReady && <ChannelListScreen />}
      </OverlayProvider>
    </AppContext.Provider>
  );
};

export default () => {
  const theme = useStreamChatTheme();
  return (
    <SafeAreaProvider
      style={{ backgroundColor: theme.colors?.white_snow || "#FCFCFC" }}
    >
      <App />
    </SafeAreaProvider>
  );
};
