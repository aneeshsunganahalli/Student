import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { images } from "@/constants/images";
import SearchBar from "@/app/components/SearchBar";

interface Section {
  title: string;
  content: string;
  key_points: string[];
}

interface Content {
  topic: string;
  summary: string;
  sections: Section[];
  references: string[];
  difficulty_level: string;
}

const SearchContentScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<Content | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a topic to search.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://192.168.29.239:8000/api/generate-content/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: searchQuery }),
      });
      const data: Content = await response.json();
      setContent(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      alert("Failed to fetch content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Background Image */}
      <Image
        source={images.bg}
        style={{ position: "absolute", width: "100%", height: "100%", zIndex: 0 }}
        resizeMode="cover"
      />

      {/* Search Bar */}
      <View style={{ padding: 16, zIndex: 1 }}>
        <SearchBar
          placeholder="Search for a topic..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Submit Button */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16, zIndex: 1 }}>
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, zIndex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#8B5CF6" />
        ) : content ? (
          <View>
            {/* Topic */}
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 16 }}>
              {content.topic}
            </Text>

            {/* Summary */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>Summary</Text>
              <Text style={{ color: "#A8B5DB" }}>{content.summary}</Text>
            </View>

            {/* Sections */}
            {content.sections.map((section, index) => (
              <View
                key={index}
                style={{
                  marginBottom: 24,
                  borderBottomWidth: 1,
                  borderColor: "#374151",
                  paddingBottom: 16,
                  backgroundColor: "#2E2E3E",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>
                  {section.title}
                </Text>
                <Text style={{ color: "#A8B5DB", marginBottom: 8 }}>{section.content}</Text>
                <Text style={{ fontWeight: "bold", color: "#FFFFFF" }}>Key Points:</Text>
                <View style={{ marginTop: 8 }}>
                  {section.key_points.map((point, idx) => (
                    <Text key={idx} style={{ color: "#A8B5DB", paddingLeft: 16 }}>
                      • {point}
                    </Text>
                  ))}
                </View>
              </View>
            ))}

            {/* References */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>References</Text>
              {content.references.map((reference, idx) => (
                <Text key={idx} style={{ color: "#A8B5DB" }}>
                  • {reference}
                </Text>
              ))}
            </View>

            {/* Difficulty Level */}
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>Difficulty Level</Text>
              <Text style={{ color: "#A8B5DB" }}>{content.difficulty_level}</Text>
            </View>
          </View>
        ) : (
          <Text style={{ textAlign: "center", color: "#A8B5DB" }}>
            No content to display. Search for a topic to get started.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 6,
    backgroundColor: "#7d2ae8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default SearchContentScreen;