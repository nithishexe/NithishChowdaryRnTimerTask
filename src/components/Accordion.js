import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {Pressable, StyleSheet, Text, View, Image} from 'react-native';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useAnimatedStyle,
  runOnUI,
  measure,
  useDerivedValue,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
} from 'react-native-reanimated';
import {images} from '../constants.js/images';

const Chevron = ({progress}) => {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${progress.value * -180}deg`}],
  }));

  return (
    <Animated.View style={iconStyle}>
      <Image source={images.chevron} style={styles.chevron} />
    </Animated.View>
  );
};

const Accordion = forwardRef(({value, numberOfRows}, ref) => {
  const open = useSharedValue(numberOfRows && numberOfRows > 0);
  const toggle = () => {
    open.value = !open.value;
  };

  const listRef = useAnimatedRef();
  const heightValue = useSharedValue(0);
  const progress = useDerivedValue(() =>
    open.value ? withTiming(1) : withTiming(0),
  );

  useImperativeHandle(ref, () => ({
    toggle,
  }));

  useEffect(() => {
    if (numberOfRows && numberOfRows > 0) {
      runOnUI(() => {
        'worklet';
        if (listRef && listRef.current) {
          const newHeight = measure(listRef).height;
          if (newHeight !== null && newHeight > 0) {
            heightValue.value = newHeight;
          }
        }
      })();

      if (!open.value) toggle();
    } else {
      open.value = false;
    }
  }, [numberOfRows]);

  const heightAnimationStyle = useAnimatedStyle(() => ({
    height: interpolate(
      progress.value,
      [0, 1],
      [0, heightValue.value],
      Extrapolation.CLAMP,
    ),
  }));
  useAnimatedReaction(
    () => {
      return {
        open: open.value,
        height: heightValue.value,
        progress: progress.value,
      };
    },
    values => {
      console.log('Accordion State:', values);
    },
    [open, heightValue, progress],
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          if (heightValue.value === 0) {
            runOnUI(() => {
              'worklet';
              heightValue.value = measure(listRef).height;
            })();
          }
          open.value = !open.value;
        }}
        style={styles.titleContainer}>
        <Text style={styles.textTitle}>{value.title}</Text>
        <Chevron progress={progress} />
      </Pressable>
      <Animated.View style={heightAnimationStyle}>
        <Animated.View
          style={styles.contentContainer}
          ref={listRef}
          onLayout={event => {
            const newHeight = event.nativeEvent.layout.height;
            if (newHeight > 0) {
              heightValue.value = newHeight;
            }
          }}>
          {Array.isArray(value.content)
            ? value.content.map((v, i) => (
                <View key={i} style={styles.content}>
                  <Text style={styles.textContent}>{v}</Text>
                </View>
              ))
            : value.content}
        </Animated.View>
      </Animated.View>
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E3EDFB',
    // marginHorizontal: 0,
    marginVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0F56B3',
    overflow: 'hidden',
  },
  textTitle: {
    fontSize: 16,
    color: 'black',
    fontWeight: '800',
  },
  titleContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    backgroundColor: '#D6E1F0',
    borderBottomColor: '#D6E1F0',
  },
  contentContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    top: 0,
    // marginBottom: 70,
    // paddingBottom: 20,
  },
  content: {
    padding: 5,
    paddingTop: 20,
    // backgroundColor: '#D6E1F0',
  },
  textContent: {
    fontSize: 14,
    color: 'black',
  },
  chevron: {
    width: 24,
    height: 24,
  },
});

export default Accordion;
