import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firestore } from '../firebase'; // Importa la instancia de Firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const RegistroNuevo = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleRegistrar = async () => {
    try {
      const clientesCollection = collection(firestore, 'clientes');

      // Agrega el documento con los datos del usuario
      await addDoc(clientesCollection, {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        contrasena: contrasena,
        fechaCreacion: serverTimestamp(), // Establece la fecha de creación como la fecha actual del servidor
        rol: correo === 'admin@admin.com' ? 'superadmin' : 'usuario', // Verifica si es superadmin
        activo: true // Establece el estado activo del usuario como verdadero por defecto
      });

      Alert.alert('Usuario registrado exitosamente');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      Alert.alert('Error al registrar usuario. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro Nuevo</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry={true}
      />
      <Button title="Registrarse" onPress={handleRegistrar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default RegistroNuevo;
