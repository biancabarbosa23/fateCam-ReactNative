import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

const Header = function({title}){
    return(
        <View>
            <Text style = {styles.header}>
                {title}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 10,
        paddingBottom: 5,
        textAlign: 'center',
        color: "#FFFFFF",
        backgroundColor:"#1a237e"
    }
})

export default Header