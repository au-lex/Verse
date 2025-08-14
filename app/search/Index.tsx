import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SafeLayout from '@/safeLayout/SafeLayout'
import BibleSearchScreen from '@/screens/Search/Search'


const index = () => {
  return (
    <SafeLayout>

    <View style={{ flex: 1 }}>
<BibleSearchScreen />
    </View>
    </SafeLayout>
  )
}

export default index

const styles = StyleSheet.create({})