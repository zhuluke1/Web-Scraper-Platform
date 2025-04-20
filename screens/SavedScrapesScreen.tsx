import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function SavedScrapesScreen({ navigation }) {
  const [savedScrapes, setSavedScrapes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedScrapes();
    
    // Refresh list when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedScrapes();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadSavedScrapes = async () => {
    try {
      setIsLoading(true);
      const savedScrapesJson = await AsyncStorage.getItem('savedScrapes');
      if (savedScrapesJson) {
        const scrapes = JSON.parse(savedScrapesJson);
        setSavedScrapes(scrapes);
      } else {
        setSavedScrapes([]);
      }
    } catch (error) {
      console.error('Error loading saved scrapes:', error);
      Alert.alert('Error', 'Failed to load saved scrapes');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteScrape = async (id) => {
    Alert.alert(
      'Delete Scrape',
      'Are you sure you want to delete this saved scrape?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedScrapes = savedScrapes.filter(scrape => scrape.id !== id);
              await AsyncStorage.setItem('savedScrapes', JSON.stringify(updatedScrapes));
              setSavedScrapes(updatedScrapes);
            } catch (error) {
              console.error('Error deleting scrape:', error);
              Alert.alert('Error', 'Failed to delete scrape');
            }
          },
        },
      ]
    );
  };

  const viewScrapeDetails = (scrape) => {
    navigation.navigate('ScrapeDetails', { scrape });
  };

  const renderScrapeItem = ({ item }) => {
    // Format date
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
    return (
      <TouchableOpacity 
        style={styles.scrapeItem}
        onPress={() => viewScrapeDetails(item)}
      >
        <View style={styles.scrapeContent}>
          <Text style={styles.scrapeTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.scrapeUrl} numberOfLines={1}>{item.url}</Text>
          <Text style={styles.scrapeDate}>{formattedDate}</Text>
          
          <View style={styles.scrapeStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="link" size={16} color="#3498db" />
              <Text style={styles.statText}>
                {item.data.links?.length || 0} links
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="image" size={16} color="#3498db" />
              <Text style={styles.statText}>
                {item.data.images?.length || 0} images
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteScrape(item.id)}
        >
          <MaterialIcons name="delete" size={22} color="#e74c3c" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Scrapes</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading saved scrapes...</Text>
        </View>
      ) : savedScrapes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No saved scrapes yet</Text>
          <TouchableOpacity 
            style={styles.newScrapeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.newScrapeButtonText}>Scrape a Website</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedScrapes}
          renderItem={renderScrapeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 60,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 10,
    marginBottom: 20,
  },
  newScrapeButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  newScrapeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 15,
  },
  scrapeItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrapeContent: {
    flex: 1,
  },
  scrapeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  scrapeUrl: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 5,
  },
  scrapeDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  scrapeStats: {
    flexDirection: 'row',
    marginTop: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  deleteButton: {
    padding: 5,
    justifyContent: 'center',
  },
});
