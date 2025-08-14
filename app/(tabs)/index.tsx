import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SafeLayout from '@/safeLayout/SafeLayout'

const index = () => {
  return (
    <SafeLayout>

    <View style={{ flex: 1 }}>
      <Text>index</Text>
    </View>
    </SafeLayout>
  )
}

export default index

const styles = StyleSheet.create({})