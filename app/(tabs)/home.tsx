import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SafeLayout from '@/safeLayout/SafeLayout'
import BibleHomeScreen from '@/screens/Home/Home'

const index = () => {
  return (
    <SafeLayout>

    <View style={{ flex: 1 }}>
<BibleHomeScreen />
    </View>
    </SafeLayout>
  )
}

export default index

const styles = StyleSheet.create({})