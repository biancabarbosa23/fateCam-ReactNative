//cSpell: ignore Permissao, Ionicons, Padrao, icone
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView, View, Text, Platform, StyleSheet, TouchableOpacity, Alert, ToastAndroid } from 'react-native'

import{ Camera } from 'expo-camera'
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'
import { Ionicons } from '@expo/vector-icons'

import Header from "./components/Header"

export default function App(){
  //tipo inicial da câmera
  const [tipoCamera, setTipoCamera] = useState(Camera.Constants.Type.back)
  //Status do acesso à câmera
  const [temPermissao, setTemPermissao] = useState(null)
  //Status inicial do flash
  const [tipoFlash, setTipoFlash] = useState(Camera.Constants.FlashMode.on)
  //referência da câmera
  const cameraRef = useRef(null)
  //tipo do ícone que será exibido
  const [iconePadrao, setIconePadrao] = useState('md')

  //verificando no momento do carregamento
  useEffect(function(){
    (async function(){
      if(Platform.OS === 'web'){
        setTemPermissao(null)
      }else{
        const {status} = await Camera.requestPermissionsAsync()
        setTemPermissao(status === 'granted')
      }
    })();
  },[])

  //Verificar qual é o SO do dispositivo
  useEffect(function(){
    switch(Platform.OS){
      case 'android':
        setIconePadrao('md')
        break
      case 'ios':
        setIconePadrao('ios')
        break
    }
  },[])

  //A permissão é nula?
  if(temPermissao === null){
    return(
      <SafeAreaView>
        <Text> Não há câmera no dispositivo web!</Text>
      </SafeAreaView>
    )
  }

  //A permissão é false
  if(temPermissao === null){
    return(
      <SafeAreaView>
        <Text>Acesso negado à câmera!</Text>
      </SafeAreaView>
    )
  }

  async function tirarFoto(){
    if(cameraRef){
      const options ={
        quality: 0.7,
        skipProcessing: true
      }
      const foto = await cameraRef.current.takePictureAsync(options)
      let msg = `A sua foto ${foto.height}X${foto.width} foi tirada com sucesso`
      {
        iconePadrao === 'md' ? ToastAndroid.showWithGravity(msg,ToastAndroid.LONG, ToastAndroid.CENTER) 
                             : Alert.alert('Imagem capturada',msg)
      }
      console.log(foto)
    }
  }

  function inverterFoto(){
    setTipoCamera(
      tipoCamera === Camera.Constants.Type.back? Camera.Constants.Type.front : Camera.Constants.Type.back
      )
  }

  return(
    <SafeAreaView style={styles.container}>
      <Header title="FateCam"/>
      <Camera style = {{ flex: 1}} type={tipoCamera} flashMode = {tipoFlash} ref={cameraRef}>
        <View style={styles.camera}>
          <TouchableOpacity style={styles.touch} onPress={tirarFoto}>
            <Ionicons name= {`${iconePadrao}-camera`} size={40} color="#9E9E9E"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touch} onPress={inverterFoto}>
            <Ionicons name= {`${iconePadrao}-reverse-camera`} size={40} color="#9E9E9E"/>
          </TouchableOpacity>
        </View>
      </Camera>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center'
  },
  camera:{
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  touch:{
    margin: 20
  }
})