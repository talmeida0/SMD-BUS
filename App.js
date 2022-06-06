// In App.js in a new project

import React, { Component, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Label,
  ActivityIndicator,
  Button,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import config from './config/index.json';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//MAPA

function AlarmScreen() {
  const mapEl = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    (async function () {
      const { status, permissions } = await Permissions.askAsync(
        Permissions.LOCATION
      );
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({
          enableHighAccuracy: true,
        });
        setOrigin({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.000922,
          longitudeDelta: 0.000421,
        });
      } else {
        throw new Error('Location permission not granted');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={origin}
        showsUserLocation={true}
        loadingEnabled={true}
        ref={mapEl}>
        {destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={config.googleApi}
            strokeWidth={3}
            onReady={(result) => {
              setDistance(result.distance);
              setPrice(result.distance * 3);
              mapEl.current.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  top: 50,
                  bottom: 50,
                  left: 50,
                  right: 50,
                },
              });
            }}
          />
        )}
      </MapView>

      <View style={styles.search}>
        <GooglePlacesAutocomplete
          placeholder="Para onde vamos?"
          onPress={(data, details = null) => {
            setDestination({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              latitudeDelta: 0.000922,
              longitudeDelta: 0.000421,
            });
          }}
          query={{
            key: config.googleApi,
            language: 'pt-br',
          }}
          enablePoweredByContainer={false}
          fetchDetails={true}
          styles={{
            listView: { backgroundColor: '#fff' },
          }}
        />

        {distance && (
          <View style={styles.distance}>
            <Text style={styles.distance__text}>
              Distância: {distance.toFixed(2).replace('.', ',')}km
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------

function AccountScreen({ navigation }) {
  return (
    <View style={styles.container}>
      
      <Text style={styles.text}>Usuário:</Text>
      <Text style={styles.appText}>eve.holt@reqres.in</Text>

      <Text style={styles.text}>Nome:</Text>
      <Text style={styles.appText}> Elaine Veholt</Text>

      
      <Text style={styles.text}>Senha:</Text>
      <Text style={styles.appText}> ******** </Text>

      <TouchableOpacity
        style={styles.appBotao}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.appText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

function FeedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.appText}> Seja Bem-Vindo </Text>
      <Text style={styles.appText}>
        {' '}
        StopBus é um aplicativo para criar alarmes.....{' '}
      </Text>
    </View>
  );
}

// LOGIN DO APP

async function validateLogin(user,password,statusSetter,activitySetter){
    activitySetter(true)

    var obj = { "email": user,
                "password":password};

    console.log(obj)

    await fetch(
      'https://reqres.in/api/login', 
      {
          method: 'POST',
          headers: 
          {
             Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(obj)
      }).then(response => {
          if (response.status === 200) {
            statusSetter('Clique aqui para entrar')
            response.text().then(function(result){ 
              console.log(result); 
              });
            
            activitySetter(false)
          } else {
            statusSetter('Usuário Incorreto')
          }
          activitySetter(false)
      })
      .then(response => {
        console.debug(response);
      }).catch(error => {
        console.error(error);
      });
}

function LoginScreen({ navigation }) {
  
  const [user,setUser]=React.useState('')
  const [password,setPassword]=React.useState('')
  const [status,setStatus]=React.useState('')
  const [activity,setActivity]=React.useState(false)

  return (
    <View style={styles.container}>
      
      <Image source={require('./assets/StopBus+.png')} style={styles.logo} />

      <Text style={styles.text}>Usuário:</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Digite seu usuário" 
        clearButtonMode = "always"
        onChangeText={(value) => setUser(value)}
      />

      <Text style={styles.text}>Senha:</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="Digite sua senha"
        clearButtonMode = "always"
        onChangeText={(value) => setPassword(value)}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={() => 
          validateLogin(user,password,setStatus,setActivity)}>
        <Text style={styles.text}>Validar</Text>
      </TouchableOpacity>

      <View style={{marginTop:10}}>
        <ActivityIndicator size="large" animating={activity}/>
      </View>

      <Text 
        style={styles.appText}
        onPress={() => navigation.navigate('Home')}> {status} </Text>
    </View>
  );
} 

//NAVEGAÇÃO

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#272727',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          color: '#E598D8',
          fontWeight: 'bold',
        },
      }}>
      <Tab.Screen name="Inicio" component={FeedScreen} />
      <Tab.Screen name="Alarmes" component={AlarmScreen} />
      <Tab.Screen name="Conta" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//CUSTOMIZAÇÃO

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#272727',
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  input: {
    marginTop: 10,
    width: 250,
    height: 50,
    padding: 10,
    backgroundColor: '#ffff',
    fontsize: 16,
    fontWeight: 'bold',
    borderRadius: 3,
  },
  text: {
    marginTop: 10,
    textAlign: 'center',
    color: '#E598D8',
  },
  botao: {
    marginTop: 20,
    borderRadius: 5,
    width: 100,
    height: 50,
    textAlign: 'center',
    borderColor: 'white',
    borderWidth: 3,
  },
  appText: {
    marginTop: 10,
    textAlign: 'center',
    color: 'white',
  },
  appBotao: {
    marginTop: 20,
    borderRadius: 5,
    width: 75,
    height: 50,
    textAlign: 'center',
    borderColor: '#E598D8',
    borderWidth: 3,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  search: {
    width: Dimensions.get('window').width,
    height: 700,
    backgroundColor: 'white',
  },
  distance: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  distance__text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default App;