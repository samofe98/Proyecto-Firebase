import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Linking } from 'react-native';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { appFirebase } from '../firebase';
import { Picker } from '@react-native-picker/picker';

const Carrito = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [db, setDb] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const initializeFirestore = async () => {
      try {
        const firestore = getFirestore(appFirebase);
        setDb(firestore);
      } catch (error) {
        console.error('Error initializing Firestore:', error);
      }
    };

    initializeFirestore();
  }, []);

  useEffect(() => {
    if (db) {
      cargarClientes();
      cargarProductos();
    }
  }, [db]);

  const cargarClientes = async () => {
    try {
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = clientesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return { id: doc.id, ...data, correo: data.correo || '' };
      });
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar los clientes:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      const productosData = productosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  };

  const updateStockProducto = async (productoId, nuevoStock) => {
    try {
      const productoDocRef = doc(db, 'productos', productoId);
      await updateDoc(productoDocRef, { stock: nuevoStock });
    } catch (error) {
      console.error('Error al actualizar el stock del producto:', error);
      Alert.alert('Error', 'No se pudo actualizar el stock del producto. Por favor, inténtalo de nuevo.');
    }
  };

  const agregarProductoCarrito = () => {
    if (!clienteSeleccionadoId || !productoSeleccionadoId || cantidad.trim() === '') {
      Alert.alert('Error', 'Por favor selecciona un cliente, un producto y especifica la cantidad');
      return;
    }

    const clienteSeleccionado = clientes.find(cliente => cliente.id === clienteSeleccionadoId);
    const productoSeleccionado = productos.find(producto => producto.id === productoSeleccionadoId);

    if (!clienteSeleccionado || !productoSeleccionado) {
      Alert.alert('Error', 'Cliente o producto seleccionado no encontrado');
      return;
    }

    const cantidadNumerica = parseInt(cantidad);

    if (cantidadNumerica > productoSeleccionado.stock) {
      Alert.alert('Error', 'No hay suficiente stock disponible');
      return;
    }

    const subtotal = productoSeleccionado.valorUnitario * cantidadNumerica;
    const nuevoStock = productoSeleccionado.stock - cantidadNumerica;

    updateStockProducto(productoSeleccionadoId, nuevoStock);
    
    const nuevoItem = {
      cliente: clienteSeleccionado.nombre,
      producto: productoSeleccionado.nombre,
      cantidad: cantidadNumerica,
      valorUnitario: productoSeleccionado.valorUnitario,
      subtotal: subtotal,
    };

    setCarrito(prevCarrito => [...prevCarrito, nuevoItem]);
    setTotal(prevTotal => prevTotal + subtotal);

    // Limpiar entradas después de agregar al carrito
    setCantidad('');
  };

  const enviarCorreo = async (correo, facturaId, clienteNombre, carrito, totalFactura) => {
    const productosDetalles = carrito.map(item => `${item.producto} - Cantidad: ${item.cantidad} - Subtotal: $${item.subtotal}`).join('\n');

    const cuerpoCorreo = `Hola ${clienteNombre},\n\nTu factura ha sido generada con éxito.\n\nDetalles de la compra:\n${productosDetalles}\n\nTotal: $${totalFactura}\n\nGracias por tu compra.`;

    const asuntoCorreo = `Factura ID: ${facturaId}`;

    const urlCorreo = `mailto:${correo}?subject=${asuntoCorreo}&body=${cuerpoCorreo}`;

    try {
      const supported = await Linking.canOpenURL(urlCorreo);
      if (supported) {
        await Linking.openURL(urlCorreo);
      } else {
        console.log("No se pudo abrir el cliente de correo.");
      }
    } catch (error) {
      console.error('Error al enviar el correo:', error);
    }
  };

  const pagarYGenerarFactura = async () => {
    if (carrito.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return;
    }

    try {
      const clienteSeleccionado = clientes.find(cliente => cliente.id === clienteSeleccionadoId);

      if (!clienteSeleccionado) {
        Alert.alert('Error', 'Cliente seleccionado no encontrado');
        return;
      }

      if (!clienteSeleccionado.correo) {
        Alert.alert('Error', 'El cliente seleccionado no tiene un correo electrónico registrado');
        return;
      }

      const totalFactura = carrito.reduce((acc, item) => acc + item.subtotal, 0);

      const facturaRef = await addDoc(collection(db, 'facturas'), {
        cliente: clienteSeleccionado.nombre,
        productos: carrito,
        total: totalFactura,
        fecha: new Date().toISOString(),
        correo: clienteSeleccionado.correo,
      });

      // Enviar correo electrónico con los detalles de la factura
      await enviarCorreo(clienteSeleccionado.correo, facturaRef.id, clienteSeleccionado.nombre, carrito, totalFactura);

      Alert.alert('Factura Generada', `La factura se ha guardado con el ID: ${facturaRef.id}`);
      setCarrito([]);
      setTotal(0);
    } catch (error) {
      console.error('Error al guardar la factura:', error);
      Alert.alert('Error', 'No se pudo guardar la factura. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Carrito de Compras</Text>
      </View>
      <Text>Total: ${total.toLocaleString('es-CO')}</Text>
      <Text>Cliente Seleccionado: {clienteSeleccionadoId ? clientes.find(cliente => cliente.id === clienteSeleccionadoId)?.nombre : 'Ninguno'}</Text>
      <Picker
        selectedValue={clienteSeleccionadoId}
        onValueChange={(itemValue) => setClienteSeleccionadoId(itemValue)}
      >
        <Picker.Item label="Selecciona un cliente" value={null} />
        {clientes.map((cliente) => (
          <Picker.Item key={cliente.id} label={cliente.nombre} value={cliente.id} />
        ))}
      </Picker>
      <Text>Producto Seleccionado: {productoSeleccionadoId ? productos.find(producto => producto.id === productoSeleccionadoId)?.nombre : 'Ninguno'}</Text>
      <Picker
        selectedValue={productoSeleccionadoId}
        onValueChange={(itemValue) => setProductoSeleccionadoId(itemValue)}
      >
        <Picker.Item label="Selecciona un producto" value={null} />
        {productos.map((producto) => (
          <Picker.Item key={producto.id} label={producto.nombre} value={producto.id} />
        ))}
      </Picker>
      <TextInput
        placeholder="Cantidad"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
      />
      <Button title="Agregar al Carrito" onPress={agregarProductoCarrito} />
      <FlatList
        data={carrito}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.carritoItem}>
            <Text>{item.producto} - Cantidad: {item.cantidad} - Subtotal: ${item.subtotal}</Text>
          </View>
        )}
      />
      <Button title="Pagar y Generar Factura" onPress={pagarYGenerarFactura} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  carritoItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Carrito;