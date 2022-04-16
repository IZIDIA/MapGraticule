import classNames from 'classnames';
import { forwardRef, Ref, useCallback, useEffect, useMemo, useState } from 'react';
import { CommonProps } from './CommonProps';
import './NumberInput.css';

interface Props {
	min: number;
	max: number;
	step: number;
	defaultValue: number;
	value: number;
	onChange: (value: number) => void;
	placeholder: string;
	disabled: boolean;
	readOnly: boolean;
}

function stringify(value: number) {
	return value.toString();
}

const parse = parseFloat;

export const NumberInput = forwardRef(function NumberInput(
	props: Partial<Readonly<Props>> & CommonProps,
	ref: Ref<HTMLInputElement>,
) {
	const onChange = props.onChange;
	const { min, max } = useMemo(() => {
		return getNormalizedMinMax(props.min, props.max);
	}, [props.min, props.max]);
	const step = useMemo(() => {
		return getNormalizedStep(props.step);
	}, [props.step]);
	const [internalValue, setInternalValue] = useState<number>(() => {
		return getClampedValue(min, max, props.value ?? props.defaultValue);
	});
	const [inputStringValue, setInputStringValue] = useState<string>(() => {
		return stringify(internalValue);
	});
	const [canUpdateInputStringValue, setCanUpdateInputStringValue] = useState<boolean>(false);
	useEffect(() => {
		setCanUpdateInputStringValue(true);
	}, [min, max, props.value]);
	const getValue = useCallback((text: string) => {
		const parsedValue = parse(text);
		return Number.isFinite(parsedValue) && getClampedValue(min, max, parsedValue) === parsedValue ? parsedValue : undefined;
	}, [min, max]);
	const [firedValue, setFiredValue] = useState<number | undefined>(undefined);
	const fireOnChange = useCallback((value: number | undefined) => {
		if (value !== undefined && firedValue !== value) {
			setFiredValue(value);
			if (onChange !== undefined) {
				onChange(value);
			}
		}
	}, [firedValue, onChange]);
	useEffect(() => {
		if (props.value !== undefined) {
			const newValue = getClampedValue(min, max, props.value);
			setInternalValue(newValue);
			const inputValue = getValue(inputStringValue);
			if (canUpdateInputStringValue && inputValue !== newValue) {
				setInputStringValue(stringify(newValue)); // internalValue
				setCanUpdateInputStringValue(false);
			}
			fireOnChange(newValue);
		}
	}, [fireOnChange, getValue, inputStringValue, internalValue, canUpdateInputStringValue, max, min, props.value]);
	return (
		<input
			ref={ref}
			className={classNames('NumberInput', props.className, {
				'NumberInput-invalid': getValue(inputStringValue) === undefined,
			})}
			style={props.style}
			type="number"
			readOnly={props.readOnly}
			disabled={props.disabled}
			placeholder={props.placeholder}
			min={min}
			max={max}
			step={step}
			value={inputStringValue}
			onChange={event => {
				const newStringValue = event.target.value;
				setInputStringValue(newStringValue);
				setCanUpdateInputStringValue(false);
				fireOnChange(getValue(newStringValue));
			}}
			onBlur={() => {
				setInputStringValue(stringify(internalValue));
				setCanUpdateInputStringValue(false);
			}}
		></input>
	);
});

function getNormalizedMinMax(min: number | undefined, max: number | undefined) {
	if (min !== undefined && !Number.isFinite(min)) {
		min = undefined;
	}
	if (max !== undefined) {
		if (Number.isFinite(max)) {
			if (min !== undefined) {
				max = Math.max(min, max);
			}
		}
		else {
			max = undefined;
		}
	}
	return { min, max };
}

function getNormalizedStep(step: number | undefined) {
	if (step !== undefined) {
		if (!Number.isFinite(step) || step <= 0) {
			step = undefined;
		}
	}
	return step;
}

function getClampedValue(min: number | undefined, max: number | undefined, value: number | undefined): number {
	if (value === undefined || Number.isNaN(value)) {
		value = 0;
	}
	if (max !== undefined) {
		value = Math.min(max, value);
	}
	if (min !== undefined) {
		value = Math.max(min, value);
	}
	return value;
}
