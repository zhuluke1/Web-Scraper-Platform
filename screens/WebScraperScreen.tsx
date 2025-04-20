import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WebScraperScreen({ route, navigation }) {
  const { url } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [scrapingComplete, setScrapingComplete] = useState(false);
  const webViewRef = useRef(null);

  const INJECTED_JAVASCRIPT = `
    (function() {
      const pageTitle = document.title;
      
      const bodyText = document.body.innerText;
      
      const links = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(link => link.text && link.href);
      
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt
      })).filter(img => img.src);
      
      const metaTags = Array.from(document.querySelectorAll('meta')).map(meta => ({
        name: meta.getAttribute('name') || meta.getAttribute('property'),
        content: meta.getAttribute('content')
      })).filter(meta => meta.name && meta.content);
      
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        type: h.tagName,
        text: h.innerText.trim()
      })).filter(h => h.text);
      
      const result = {
        pageTitle,
        bodyText: bodyText.substring(0, 10000),
        links: links.slice(0, 100),
        images: images.slice(0, 50),
        metaTags,
        headings,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      
      return true;
    })();
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setScrapedData(data);
      setPageTitle(data.pageTitle);
      setScrapingComplete(true);
    } catch (error) {
      console.error('Error parsing scraped data:', error);
      Alert.alert('Error', 'Failed to parse scraped data');
    }
  };

  const saveScrapedData = async () => {
    if (!scrapedData) return;
    
    try {
      const savedScrapesJson = await AsyncStorage.getItem('savedScrapes');
      const savedScrapes = savedScrapesJson ? JSON.parse(savedScrapesJson) : [];
      
      const newScrape = {
        id: Date.now().toString(),
        url: scrapedData.url,
        title: scrapedData.pageTitle,
        timestamp: scrapedData.timestamp,
        data: scrapedData
      };
      
      const updatedScrapes = [newScrape, ...savedScrapes];
      await AsyncStorage.setItem('savedScrapes', JSON.stringify(updatedScrapes));
      
      Alert.alert(
        'Success',
        'Website data saved successfully',
        [
          { 
            text: 'View Saved', 
            onPress: () => navigation.navigate('SavedScrapes') 
          },
          { 
            text: 'OK', 
            style: 'cancel' 
          },
        ]
      );
    } catch (error) {
      console.error('Error saving scraped data:', error);
      Alert.alert('Error', 'Failed to save scraped data');
    }
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {pageTitle || url}
        </Text>
        {scrapingComplete && (
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveScrapedData}
          >
            <MaterialIcons name="save" size={24} color="#3498db" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.webViewContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading website...</Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            webViewRef.current.injectJavaScript(INJECTED_JAVASCRIPT);
          }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          style={styles.webView}
        />
      </View>
      
      {scrapingComplete && (
        <View style={styles.scrapedInfoBar}>
          <Text style={styles.scrapedInfoText}>
            Scraped {scrapedData?.links?.length || 0} links and {scrapedData?.images?.length || 0} images
          </Text>
        </View>
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
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  saveButton: {
    padding: 8,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  scrapedInfoBar: {
    backgroundColor: '#2ecc71',
    padding: 10,
    alignItems: 'center',
  },
  scrapedInfoText: {
    color: '#fff',
    fontWeight: '600',
  },
});
