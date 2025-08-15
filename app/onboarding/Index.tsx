import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  imageUrl?: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  imageUrl = 'https://i.pinimg.com/736x/12/e8/cb/12e8cb599a3699b1054d33f895d6021c.jpg'
}) => {
  const handleGetStarted = () => {
    // Navigate to home screen or next onboarding step
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Black Overlay */}
        <View style={styles.overlay} />
        
        {/* Content Container */}
        <View style={styles.contentWrapper}>
          {/* Main Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>HelloBible+</Text>
            
            {/* Description */}
            <Text style={styles.description}>
              The Bible is a sacred religious text of Christianity, consisting of the Old and New Testaments, containing teachings, history, prophecies, and moral guidance.
            </Text>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
  
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentWrapper: {
    flex: 1,

    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: '#F0F0F0',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },
  button: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    marginRight: 8,
  },
  arrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowLine: {
    width: 16,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    marginLeft: -1,
  },
});

export default WelcomeScreen;