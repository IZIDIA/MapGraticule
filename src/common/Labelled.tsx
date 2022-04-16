import classNames from 'classnames';
import { ReactNode } from 'react';
import { CommonProps } from './CommonProps';

export function Labelled(props: Partial<Readonly<{
	label: string;
	children: ReactNode;
}>> & CommonProps) {
	return (
		<div
			className={classNames('Labelled', props.className)}
			style={props.style}
		>
			<label>{props.label}</label>
			{props.children}
		</div>
	);
}
