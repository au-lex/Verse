import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SafeLayout from '@/safeLayout/SafeLayout'
import BibleChapterSelection from '@/screens/Bible/Chapter-Selection'

const index = () => {
  return (
    <SafeLayout>

    <View style={{ flex: 1 }}>
<BibleChapterSelection />
    </View>
    </SafeLayout>
  )
}

export default index

const styles = StyleSheet.create({})