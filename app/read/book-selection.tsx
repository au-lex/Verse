import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SafeLayout from '@/safeLayout/SafeLayout'
import BibleBookSelection from '@/screens/Bible/Book-Selection'

const index = () => {
  return (
    <SafeLayout>

    <View style={{ flex: 1 }}>
<BibleBookSelection />
    </View>
    </SafeLayout>
  )
}

export default index

const styles = StyleSheet.create({})