import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGetBibles } from '@/hooks/ApiConfig';

const { width } = Dimensions.get('window');

interface Bible {
  id: string;
  dblId: string;
  abbreviation: string;
  abbreviationLocal: string;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  countries: Array<{
    id: string;
    name: string;
    nameLocal: string;
  }>;
  type: string;
  updatedAt: string;
  relatedDbl?: string;
  audioBibles?: Bible[];
}

const ITEMS_PER_PAGE = 10;


const AnimatedVersionCard: React.FC<{ 
  bible: Bible; 
  selectedVersion: string; 
  onSelect: (id: string) => void;
  index: number;
}> = ({ bible, selectedVersion, onSelect, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const selectionAnim = useRef(new Animated.Value(0)).current;

  const isSelected = selectedVersion === bible.id;

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, index]);

  useEffect(() => {
    // Selection animation
    Animated.spring(selectionAnim, {
      toValue: isSelected ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isSelected, selectionAnim]);

  const handlePress = () => {
    // Add haptic feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(bible.id);
  };

  const cardScale = Animated.add(
    scaleAnim,
    Animated.multiply(selectionAnim, 0.02)
  );

  const borderOpacity = Animated.multiply(selectionAnim, 1);
  const backgroundOpacity = Animated.multiply(selectionAnim, 0.1);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: cardScale }
          ],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.versionCard}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.selectionBorder,
            {
              opacity: borderOpacity,
            }
          ]}
        />
        <Animated.View
          style={[
            styles.selectionBackground,
            {
              opacity: backgroundOpacity,
            }
          ]}
        />
        
        <View style={styles.versionHeader}>
          <View style={styles.versionInfo}>
            <View style={styles.versionTitleRow}>
              <Text style={styles.versionAbbreviation}>{bible.abbreviation}</Text>
              <View style={styles.languageBadge}>
                <Text style={styles.languageText}>{bible.language.name}</Text>
              </View>
            </View>
            <Text style={styles.versionName}>{bible.name}</Text>
            <Text style={styles.versionDescription}>{bible.description}</Text>
          </View>
          
          <View style={styles.versionActions}>
            <Animated.View
              style={[
                styles.selectedIndicator,
                {
                  opacity: selectionAnim,
                  transform: [
                    {
                      scale: Animated.add(0.5, Animated.multiply(selectionAnim, 0.5))
                    }
                  ]
                }
              ]}
            >
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Search Bar Component
const AnimatedSearchBar: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ searchQuery, onSearchChange }) => {
  const searchAnim = useRef(new Animated.Value(0)).current;
  const clearAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [searchAnim]);

  useEffect(() => {
    Animated.timing(clearAnim, {
      toValue: searchQuery.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [searchQuery, clearAnim]);

  return (
    <Animated.View 
      style={[
        styles.searchContainer,
        {
          opacity: searchAnim,
          transform: [
            {
              translateY: Animated.multiply(
                Animated.subtract(1, searchAnim),
                -20
              )
            }
          ]
        }
      ]}
    >
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search versions..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        <Animated.View
          style={[
            {
              opacity: clearAnim,
              transform: [
                {
                  scale: clearAnim
                }
              ]
            }
          ]}
        >
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const BibleVersionScreen: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const paginationAnim = useRef(new Animated.Value(0)).current;

  // Fetch bibles from API
  const { data: biblesResponse, isLoading, error } = useGetBibles();

  // Get filtered and paginated versions
  const { filteredVersions, totalPages, hasNextPage, hasPreviousPage } = useMemo(() => {
    if (!biblesResponse?.data) {
      return { filteredVersions: [], totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    }

    let versions = biblesResponse.data;

    // Apply search filter
    if (searchQuery.trim()) {
      versions = versions.filter(bible => 
        bible.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bible.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bible.language.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const totalCount = versions.length;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedVersions = versions.slice(startIndex, endIndex);

    return {
      filteredVersions: paginatedVersions,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [biblesResponse?.data, searchQuery, currentPage]);

  // Initialize animations when data loads
  useEffect(() => {
    if (!isLoading && !error) {
      Animated.stagger(100, [
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(paginationAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, error, headerAnim, buttonAnim, paginationAnim]);

  // Animate button state changes
  useEffect(() => {
    Animated.spring(buttonAnim, {
      toValue: selectedVersion ? 1.05 : 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [selectedVersion, buttonAnim]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
  };

  const handleContinue = () => {
    if (!selectedVersion) {
      Alert.alert(
        'No Version Selected',
        'Please select a Bible version to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Navigate to Bible reading with selected version
    router.push({
      pathname: '/read/book-selection',
      params: { version: selectedVersion }
    });
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading Bible versions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load versions</Text>
          <Text style={styles.errorSubtitle}>Please check your connection and try again</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: Animated.multiply(
                  Animated.subtract(1, headerAnim),
                  -30
                )
              }
            ]
          }
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Choose Bible Version</Text>
          <Text style={styles.headerSubtitle}>Select your preferred translation</Text>
        </View>
        <View style={{ width: 24 }} />
      </Animated.View>

      {/* Animated Search */}
      <AnimatedSearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Versions List */}
      <ScrollView style={styles.versionsContainer} showsVerticalScrollIndicator={false}>
        {filteredVersions.map((bible, index) => (
          <AnimatedVersionCard
            key={bible.id}
            bible={bible}
            selectedVersion={selectedVersion}
            onSelect={handleVersionSelect}
            index={index}
          />
        ))}
        
        {filteredVersions.length === 0 && !isLoading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <Text style={styles.noResultsTitle}>No versions found</Text>
            <Text style={styles.noResultsSubtitle}>Try adjusting your search query</Text>
          </View>
        )}
      </ScrollView>

      {/* Animated Pagination */}
      {totalPages > 1 && (
        <Animated.View 
          style={[
            styles.paginationContainer,
            {
              opacity: paginationAnim,
              transform: [
                {
                  translateY: Animated.multiply(
                    Animated.subtract(1, paginationAnim),
                    30
                  )
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.pageButton, !hasPreviousPage && styles.disabledPageButton]}
            onPress={handlePreviousPage}
            disabled={!hasPreviousPage}
          >
            <Ionicons 
              name="chevron-back" 
              size={16} 
              color={hasPreviousPage ? "#3B82F6" : "#9CA3AF"} 
            />
            <Text style={[
              styles.pageButtonText,
              !hasPreviousPage && styles.disabledPageButtonText
            ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.pageInfo}>
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.pageButton, !hasNextPage && styles.disabledPageButton]}
            onPress={handleNextPage}
            disabled={!hasNextPage}
          >
            <Text style={[
              styles.pageButtonText,
              !hasNextPage && styles.disabledPageButtonText
            ]}>
              Next
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={hasNextPage ? "#3B82F6" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Animated Bottom Action */}
      <Animated.View 
        style={[
          styles.bottomContainer,
          {
            transform: [
              {
                scale: buttonAnim
              },
              {
                translateY: Animated.multiply(
                  Animated.subtract(1, buttonAnim),
                  50
                )
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedVersion && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedVersion}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedVersion && styles.disabledButtonText
          ]}>
            Continue Reading
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={selectedVersion ? "#FFFFFF" : "#9CA3AF"} 
          />
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#111827',
  },
  versionsContainer: {
    flex: 1,
    padding: 16,
  },
  versionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',

  },
  selectionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  selectionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 1,
  },
  versionInfo: {
    flex: 1,
    marginRight: 16,
  },
  versionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  versionAbbreviation: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#3B82F6',
  },
  languageBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 10,
    fontFamily: 'Nunito-SemiBold',
    color: '#3B82F6',
  },
  versionName: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  versionDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  versionActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  selectedIndicator: {
    // Animated positioning handled by parent
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  disabledPageButton: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#3B82F6',
  },
  disabledPageButtonText: {
    color: '#9CA3AF',
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
    marginTop: 16,
  },
  noResultsSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});

export default BibleVersionScreen;