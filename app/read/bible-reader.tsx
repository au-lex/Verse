import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SafeLayout from '@/safeLayout/SafeLayout'


import BibleReader from '@/screens/Bible/Bible-Reader'

const index = () => {
  return (
    <SafeLayout>

    <View style={{ flex: 1 }}>
<BibleReader/>
    </View>
    </SafeLayout>
  )
}

export default index

const styles = StyleSheet.create({})