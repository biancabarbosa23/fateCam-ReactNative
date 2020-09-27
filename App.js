//cSpell: ignore Permissao, Ionicons, Padrao, icone
import React, { useState, useEffect, useRef } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Modal,
  Image
} from 'react-native'

import { Camera } from 'expo-camera'
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'

import Header from "./components/Header"

export default function App() {
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
  //Referencia a foto capturada
  const [fotoCapturada, setFotoCapturada] = useState(null)
  //controle de exibição do modal
  const [exibirModal, setExibirModal] = useState(true)
  //Dispensar aviso
  const [dispensarAviso, setDispensarAviso] = useState(false)

  //verificando no momento do carregamento
  useEffect(function () {
    //Permissão da camera
    (async function () {
      if (Platform.OS === 'web') {
        setTemPermissao(null)
      } else {
        const { status } = await Camera.requestPermissionsAsync()
        setTemPermissao(status === 'granted')
      }
    })();
    //permissão galeria da camera
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      setTemPermissao(status === 'granted')
    })()
  }, [])

  //Verificar qual é o SO do dispositivo
  useEffect(function () {
    switch (Platform.OS) {
      case 'android':
        setIconePadrao('md')
        break
      case 'ios':
        setIconePadrao('ios')
        break
    }
  }, [])

  //A permissão é nula?
  if (temPermissao === null) {
    return (
      <SafeAreaView>
        <Text> Não há câmera no dispositivo web!</Text>
      </SafeAreaView>
    )
  }

  //A permissão é false
  if (temPermissao === null) {
    return (
      <SafeAreaView>
        <Text>Acesso negado à câmera!</Text>
      </SafeAreaView>
    )
  }

  async function tirarFoto() {
    if (cameraRef) {
      const options = {
        quality: 0.7,
        skipProcessing: true
      }
      const foto = await cameraRef.current.takePictureAsync(options)

      setFotoCapturada((foto.uri))
      setExibirModal(true)
    }
  }

  async function salvarFoto() {
    const asset = await MediaLibrary.createAssetAsync(fotoCapturada)
      .then(() => {
        setExibirModal(false)

        if (dispensarAviso === false) {
          Alert.alert(
            'Foto Capturada',
            'Imagem salva com sucesso!',
            [
              { text: 'Dispensar Aviso', onPress: () => setDispensarAviso(true) },
              { text: 'Cancelar', onPress: () => console.log('pressionado'), style: 'cancel' },
              { text: 'OK', onPress: () => console.log('OK pressionado') }
            ], { cancelable: false }
          )
        }

      }).catch(error => {
        console.log('Ocorreu um erro: ', error)
      })
  }

  function inverterFoto() {
    setTipoCamera(
      tipoCamera === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
    )
  }

  async function cloudinaryUpload() {
    let foto = {
      uri: fotoCapturada,
      type: 'image/jpeg',
      name: 'foto.jpg'
    }
    let presetCloudinary = 'eblniltq'
    let cloudName = 'fatecamphoto'

    const data = new FormData()
    data.append('file', foto)
    data.append('upload_preset', presetCloudinary)
    data.append('cloud_name', cloudName)
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'post',
      body: data
    }).then(res => res.json())
      .then(data => {
        Alert.alert('Foto salva no cloudinary ' + data.public_id)
      })
      .catch(err => {
        Alert.alert('Não foi possível efetuar o upload' + err)
      })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="FateCam" />
      <Camera style={{ flex: 1 }} type={tipoCamera} flashMode={tipoFlash} ref={cameraRef}>
        <View style={styles.camera}>
          <TouchableOpacity style={styles.touch} onPress={tirarFoto}>
            <Ionicons name={`${iconePadrao}-camera`} size={40} color="#9E9E9E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.touch} onPress={inverterFoto}>
            <Ionicons name={`${iconePadrao}-reverse-camera`} size={40} color="#9E9E9E" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touch}
            onPress={() => {
              tipoFlash === Camera.Constants.FlashMode.on
                ? setTipoFlash((Camera.Constants.FlashMode.off))
                : setTipoFlash((Camera.Constants.FlashMode.on))
            }}
          >
            <Ionicons name={
              tipoFlash === Camera.Constants.FlashMode.on
                ? iconePadrao + "-flash"
                : iconePadrao + "-flash-off"
            } size={40} color='#9E9E9E' />
          </TouchableOpacity>
        </View>
      </Camera>
      {fotoCapturada &&
        <Modal
          animationType="slide"
          transparent={true}
          visible={exibirModal}
        >
          <View style={styles.modalView}>
            <View style={styles.elementButton}>
              <TouchableOpacity style={{ margin: 10 }}
                onPress={() => setExibirModal(false)}
                accessible={true}
                accessibilityLabel="Fecha a janela atual"
                accessibilityHint="Fecha a janela e volta a camera"
              >
                <Ionicons name={`${iconePadrao}-close-circle`} size={50} color='#D9534F' />

              </TouchableOpacity>
              <TouchableOpacity style={{ margin: 10 }}
                onPress={cloudinaryUpload}
              >
                <Ionicons name={`${iconePadrao}-cloud-upload`} size={50} color='#1212' />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ margin: 10 }}
                onPress={salvarFoto}
              >
                <MaterialIcons name="add-to-photos" size={50} color="#1212" />
              </TouchableOpacity>
            </View>
            <Image source={{ uri: fotoCapturada }}
              style={styles.photo}
            />
          </View>
        </Modal>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  camera: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  touch: {
    margin: 20
  },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    opacity: 0.95,
    alignItems: 'center',
    justifyContent: 'center'
  },
  elementButton: {
    margin: 10,
    flexDirection: 'row-reverse'
  },
  photo: {
    width: '100%',
    height: '70%',
    borderRadius: 20
  }

})