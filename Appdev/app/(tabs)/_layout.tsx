import { Tabs } from "expo-router";
import { ImageBackground, Image, Text, View, ImageSourcePropType } from "react-native";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

interface TabIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

function TabIcon({ focused, icon, title }: TabIconProps) {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className="flex flex-row w-full flex-1 min-w-[115px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text className="text-secondary text-base font-semibold ml-2">
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0F0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0F0D23",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          headerShown: false,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />

      <Tabs.Screen
        name="doubts"
        options={{
          title: "doubts",
          headerShown: false,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={icons.save} title="Doubts" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}


