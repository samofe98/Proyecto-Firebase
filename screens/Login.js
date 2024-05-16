import React, { useState } from 'react';
import { Text, StyleSheet, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { firestore } from '../firebase'; // Importa la instancia de Firestore
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const logueo = async () => {
    try {
      // Busca en la colección "clientes" el documento que coincida con el correo proporcionado
      const clientesCollection = collection(firestore, 'clientes');
      const q = query(clientesCollection, where('correo', '==', email));
      const querySnapshot = await getDocs(q);

      // Verifica si se encontró un documento con el correo proporcionado
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const cliente = doc.data();
          // Comprueba si la contraseña coincide
          if (cliente.contrasena === password) {
            Alert.alert('INICIANDO SESION');

            // Determinar qué pantalla mostrar según el rol del usuario
            if (cliente.rol === 'superadmin') {
              props.navigation.navigate('Home');
            } else if (cliente.rol === 'AdminProductos') {
              props.navigation.navigate('Productos');
            } else if (cliente.rol === 'AdminClientes') {
              props.navigation.navigate('Clientes');
            } else if (cliente.rol === 'Cliente') {
              props.navigation.navigate('Carrito');
            }
          } else {
            Alert.alert('Contraseña incorrecta');
          }
        });
      } else {
        Alert.alert('Usuario inactivo');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.padre}>
      <View>
        <Image source={require('../assets/Login.png')} style={styles.profile} />
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.cajaTexto}>
          <TextInput
            placeholder='correo@gmail.com'
            style={{ paddingHorizontal: 15 }}
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
        </View>
        <View style={styles.cajaTexto}>
          <TextInput
            placeholder='Contraseña'
            style={{ paddingHorizontal: 15 }}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            value={password}
          />
        </View>

        <View style={styles.botonesContainer}>
          <TouchableOpacity style={styles.cajaBoton} onPress={logueo}>
            <Text style={styles.TextoBoton}>Iniciar Sesion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registrarseButton}
            onPress={() => props.navigation.navigate('RegistroNuevo')}>
            <Text style={styles.registrarseButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  profile: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: 'white',
  },
  tarjeta: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cajaTexto: {
    paddingVertical: 20,
    backgroundColor: '#cccccc40',
    borderRadius: 30,
    marginVertical: 10,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cajaBoton: {
    backgroundColor: '#525FE1',
    borderRadius: 30,
    paddingVertical: 20,
    width: '45%',
  },
  TextoBoton: {
    textAlign: 'center',
    color: 'white',
  },
  registrarseButton: {
    backgroundColor: '#007bff',
    borderRadius: 30,
    paddingVertical: 20,
    width: '45%',
  },
  registrarseButtonText: {
    textAlign: 'center',
    color: 'white',
  },
});
