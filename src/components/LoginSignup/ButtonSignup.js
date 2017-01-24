import React, { Component, PropTypes } from 'react';
import firebase, {firebaseRef} from '../../firebase';
import Dimensions from 'Dimensions';
import {
	StyleSheet,
	TouchableOpacity,
	Text,
	Animated,
	Easing,
	Image,
	Alert,
	View,
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import ToLogin from './ToLogin';
import spinner from '../../icons/loading.gif';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

export default class ButtonSignup extends Component {
	constructor() {
		super();

		this.state = {
			isLoading: false,
		};

		this.buttonAnimated = new Animated.Value(0);
		this._onPress = this._onPress.bind(this);
	}

	_onPress() {
		if (this.state.isLoading) return;

		this.setState({ isLoading: true });
		Animated.timing(
			this.buttonAnimated,
			{
				toValue: 1,
				duration: 200,
				easing: Easing.linear
			}
		).start();

		const { todos, actions, formData } = this.props;
		const userSignup = actions.startSignup(formData.emailSignup, formData.passwordSignup);

		userSignup
			.then(snapshot => {
				const usersRef = firebaseRef.child('users');
				const todosRef = firebaseRef.child('todos');
				const todo = {
					isDone: false,
					isStarred: false,
					text: `Welcome ${snapshot.email}`
				}

				todosRef.child(snapshot.uid).push(todo);

				usersRef.child(snapshot.uid).set({
					email: formData.emailSignup,
				});

				actions.changeUserData({ email: snapshot.email });
				actions.deleteAllTodo();
				actions.fetchTodos(snapshot.uid);
				Actions.mainScreen();
			}, error => {
				Alert.alert(JSON.stringify(error.message));
			})
			.then(() => {
				this.setState({ isLoading: false });
				this.buttonAnimated.setValue(0);
				actions.changeEmailSignup('');
				actions.changePasswordSignup('');
			});
	}

	render() {
		const changeWidth = this.buttonAnimated.interpolate({
	    inputRange: [0, 1],
	    outputRange: [DEVICE_WIDTH - MARGIN, MARGIN]
	  });

		return (
			<View style={styles.container}>
				<Animated.View style={{width: changeWidth}}>
					<TouchableOpacity style={styles.button}
						onPress={this._onPress}
						activeOpacity={1} >
							{this.state.isLoading ?
								<Image source={spinner} style={styles.image} />
								:
								<Text style={styles.text}>REGISTER</Text>
							}
					</TouchableOpacity>
				</Animated.View>
				<ToLogin {...this.props} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: -10,
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#E7BCAA',
		height: MARGIN,
		borderRadius: 20,
		zIndex: 100,
	},
	text: {
		color: 'white',
		fontWeight: 'bold',
		letterSpacing: 1,
		backgroundColor: 'transparent',
	},
	image: {
		width: 24,
		height: 24,
	},
});
