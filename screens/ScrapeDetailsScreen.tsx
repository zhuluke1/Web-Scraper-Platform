import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  Share,
  Linking
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ScrapeDetailsScreen({ route, navigation }) {
  const { scrape } = route.params;
  const [activeTab, setActiveTab] = useState('overview');
  
  // Format date
  const date = new Date(scrape.timestamp);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  
  const shareData = async () => {
    try {
      const message = `
Website: ${scrape.title}
URL: ${scrape.url}
Scraped on: ${formattedDate}
Links found: ${scrape.data.links?.length || 0}
Images found: ${scrape.data.images?.length || 0}
      `;
      
      await Share.share({
        message,
        title: `Scraped data from ${scrape.title}`,
      });
    } catch (error) {
      console.error('Error sharing data:', error);
    }
  };
  
  const openUrl = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };
  
  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Website Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Title:</Text>
          <Text style={styles.infoValue}>{scrape.title}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>URL:</Text>
          <TouchableOpacity onPress={() => openUrl(scrape.url)}>
            <Text style={[styles.infoValue, styles.linkText]}>{scrape.url}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Scraped on:</Text>
          <Text style={styles.infoValue}>{formattedDate}</Text>
        </View>
      </View>
      
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Content Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <MaterialIcons name="link" size={24} color="#3498db" />
            <Text style={styles.statNumber}>{scrape.data.links?.length || 0}</Text>
            <Text style={styles.statLabel}>Links</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="image" size={24} color="#3498db" />
            <Text style={styles.statNumber}>{scrape.data.images?.length || 0}</Text>
            <Text style={styles.statLabel}>Images</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="title" size={24} color="#3498db" />
            <Text style={styles.statNumber}>{scrape.data.headings?.length || 0}</Text>
            <Text style={styles.statLabel}>Headings</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="info" size={24} color="#3498db" />
            <Text style={styles.statNumber}>{scrape.data.metaTags?.length || 0}</Text>
            <Text style={styles.statLabel}>Meta Tags</Text>
          </View>
        </View>
      </View>
      
      {scrape.data.headings && scrape.data.headings.length > 0 && (
        <View style={styles.headingsSection}>
          <Text style={styles.sectionTitle}>Main Headings</Text>
          {scrape.data.headings.slice(0, 5).map((heading, index) => (
            <View key={index} style={styles.headingItem}>
              <Text style={styles.headingType}>{heading.type}</Text>
              <Text style={styles.headingText}>{heading.text}</Text>
            </View>
          ))}
          {scrape.data.headings.length > 5 && (
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => setActiveTab('headings')}
            >
              <Text style={styles.moreButtonText}>
                View all {scrape.data.headings.length} headings
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.textPreviewSection}>
        <Text style={styles.sectionTitle}>Text Preview</Text>
        <Text style={styles.textPreview}>
          {scrape.data.bodyText?.substring(0, 300)}...
        </Text>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setActiveTab('text')}
        >
          <Text style={styles.moreButtonText}>View full text</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
  const renderLinksTab = () => (
    <FlatList
      data={scrape.data.links || []}
      keyExtractor={(item, index) => `link-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => openUrl(item.href)}
        >
          <MaterialIcons name="link" size={20} color="#3498db" />
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle} numberOfLines={1}>
              {item.text || 'No text'}
            </Text>
            <Text style={styles.linkUrl} numberOfLines={1}>
              {item.href}
            </Text>
          </View>
          <MaterialIcons name="open-in-new" size={20} color="#7f8c8d" />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyList}>
          <Text style={styles.emptyText}>No links found</Text>
        </View>
      }
      contentContainerStyle={styles.listContent}
    />
  );
  
  const renderImagesTab = () => (
    <FlatList
      data={scrape.data.images || []}
      keyExtractor={(item, index) => `image-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.imageItem}
          onPress={() => openUrl(item.src)}
        >
          <MaterialIcons name="image" size={20} color="#3498db" />
          <View style={styles.imageContent}>
            <Text style={styles.imageAlt} numberOfLines={1}>
              {item.alt || 'No description'}
            </Text>
            <Text style={styles.imageUrl} numberOfLines={1}>
              {item.src}
            </Text>
          </View>
          <MaterialIcons name="open-in-new" size={20} color="#7f8c8d" />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyList}>
          <Text style={styles.emptyText}>No images found</Text>
        </View>
      }
      contentContainerStyle={styles.listContent}
    />
  );
  
  const renderHeadingsTab = () => (
    <FlatList
      data={scrape.data.headings || []}
      keyExtractor={(item, index) => `heading-${index}`}
      renderItem={({ item }) => (
        <View style={styles.headingListItem}>
          <View style={styles.headingTypeContainer}>
            <Text style={styles.headingTypeText}>{item.type}</Text>
          </View>
          <Text style={styles.headingListText}>{item.text}</Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyList}>
          <Text style={styles.emptyText}>No headings found</Text>
        </View>
      }
      contentContainerStyle={styles.listContent}
    />
  );
  
  const renderTextTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.textContainer}>
        <Text style={styles.fullText}>{scrape.data.bodyText}</Text>
      </View>
    </ScrollView>
  );
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'links':
        return renderLinksTab();
      case 'images':
        return renderImagesTab();
      case 'headings':
        return renderHeadingsTab();
      case 'text':
        return renderTextTab();
      default:
        return renderOverviewTab();
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
          {scrape.title}
        </Text>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={shareData}
        >
          <MaterialIcons name="share" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
            onPress={() => setActiveTab('overview')}
          >
            <MaterialIcons 
              name="dashboard" 
              size={20} 
              color={activeTab === 'overview' ? '#3498db' : '#7f8c8d'} 
            />
            <Text 
              style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'links' && styles.activeTab]} 
            onPress={() => setActiveTab('links')}
          >
            <MaterialIcons 
              name="link" 
              size={20} 
              color={activeTab === 'links' ? '#3498db' : '#7f8c8d'} 
            />
            <Text 
              style={[styles.tabText, activeTab === 'links' && styles.activeTabText]}
            >
              Links ({scrape.data.links?.length || 0})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'images' && styles.activeTab]} 
            onPress={() => setActiveTab('images')}
          >
            <MaterialIcons 
              name="image" 
              size={20} 
              color={activeTab === 'images' ? '#3498db' : '#7f8c8d'} 
            />
            <Text 
              style={[styles.tabText, activeTab === 'images' && styles.activeTabText]}
            >
              Images ({scrape.data.images?.length || 0})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'headings' && styles.activeTab]} 
            onPress={() => setActiveTab('headings')}
          >
            <MaterialIcons 
              name="title" 
              size={20} 
              color={activeTab === 'headings' ? '#3498db' : '#7f8c8d'} 
            />
            <Text 
              style={[styles.tabText, activeTab === 'headings' && styles.activeTabText]}
            >
              Headings ({scrape.data.headings?.length || 0})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'text' && styles.activeTab]} 
            onPress={() => setActiveTab('text')}
          >
            <MaterialIcons 
              name="text-fields" 
              size={20} 
              color={activeTab === 'text' ? '#3498db' : '#7f8c8d'} 
            />
            <Text 
              style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}
            >
              Full Text
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.content}>
        {renderActiveTab()}
      </View>
      
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  shareButton: {
    padding: 8,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  linkText: {
    color: '#3498db',
  },
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  headingsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headingItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headingType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  headingText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  textPreviewSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textPreview: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  moreButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  moreButtonText: {
    fontSize: 14,
    color: '#3498db',
  },
  listContent: {
    padding: 15,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  linkContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 3,
  },
  linkUrl: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  imageContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  imageAlt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 3,
  },
  imageUrl: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  headingListItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  headingTypeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#3498db',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  headingTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  headingListText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  textContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fullText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});