import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SafeLayout from '@/safeLayout/SafeLayout'

import BibleVerseSelection from '@/screens/Bible/Verse_Selection'

const index = () => {
  return (
    <SafeLayout>

    <View style={{ flex: 1 }}>
<BibleVerseSelection />
    </View>
    </SafeLayout>
  )
}

export default index

const styles = StyleSheet.create({})