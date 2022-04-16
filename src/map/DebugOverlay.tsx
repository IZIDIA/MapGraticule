import classNames from 'classnames';
import { ReactNode } from 'react';
import { CommonProps } from '../common/CommonProps';
import './DebugOverlay.css';

export function DebugOverlay(props: Partial<Readonly<{
	children: ReactNode;
}>> & CommonProps) {
	return (
		<div className={classNames('DebugOverlay', props.className)} style={props.style}>
			{props.children}
		</div>
	);
}
