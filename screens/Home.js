import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Alert, Text } from 'react-native';
import { useAuth } from './Auth';

const Home = ({ navigation }) => {
  const { signOut, currentUser } = useAuth(); // Obtén la función de cerrar sesión y el usuario actual del hook de autenticación
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setWelcomeMessage(`Bienvenido, ${currentUser.nombre} ${currentUser.apellido}`);
    } else {
      setWelcomeMessage('');
    }
  }, [currentUser]);

  const handleSignOut = () => {
    signOut()
      .then(() => {
        navigation.navigate('Login'); // Si el cierre de sesión es exitoso, navega a la pantalla de inicio de sesión
      })
      .catch(error => {
        console.error('Error al cerrar sesión:', error);
        Alert.alert('Error', 'No se pudo cerrar sesión. Por favor, inténtalo de nuevo más tarde.');
      });
  };

  const handleGestionUsuarios = () => {
    navigation.navigate('GestionUsuarios');
  };

  return (
    <View style={styles.container}>
      {welcomeMessage ? (
        <Text style={styles.welcome}>{welcomeMessage}</Text>
      ) : null}
      <View style={styles.row}>
        <View style={[styles.buttonContainer, { flex: 1 }]}>
          <Button
            title="Clientes"
            onPress={() => navigation.navigate('Clientes')}
            color="#a2cffe" // Color rosa pastel
          />
        </View>
        <View style={[styles.buttonContainer, { flex: 1 }]}>
          <Button
            title="Productos"
            onPress={() => navigation.navigate('Productos')}
            color="#a2cffe" // Color azul pastel
          />
        </View>
        <View style={[styles.buttonContainer, { flex: 1 }]}>
          <Button
            title="Gestión de Usuarios"
            onPress={handleGestionUsuarios}
            color="#ff6347" // Color rojo
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.buttonContainer, { flex: 1 }]}>
          <Button
            title="Carrito de Compra"
            onPress={() => navigation.navigate('Carrito')}
            color="#a2cffe" // Color verde pastel
          />
        </View>
        <View style={[styles.buttonContainer, { flex: 1 }]}>
          <Button
            title="Facturas"
            onPress={() => navigation.navigate('Facturas')} // Navega a la pantalla de facturas
            color="#a2cffe" // Color naranja pastel
          />
        </View>
        <View style={[styles.buttonContainer, { flex: 1 }]}>
          <Button
            title="Cerrar Sesión"
            onPress={handleSignOut} // Función para cerrar sesión
            color="#ff6347" // Color rojo
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    marginHorizontal: 10,
  },
});

export default Home;
