/**
 * External dependencies
 */
import styled from '@emotion/styled';
import { map, range, get } from 'lodash';
import { useState, useEffect } from '@wordpress/element';
import { Flex } from '@wordpress/components';
import { randomHexColor } from 'random-hex-color-generator';
import isDarkColor from 'is-dark-color';

/**
 * Internal dependencies
 */
import Sortable from '../';

function ListWithState( { length, withKnobs } ) {
	const [ items, setItems ] = useState( [] );
	const handleOnSortEnd = ( value ) => {
		setItems( map( value, ( { key, props } ) => ( { name: key, backgroundColor: get( props, 'style.backgroundColor' ) } ) ) );
	};

	useEffect( () => {
		setItems( map( range( 1, length ), ( name ) => ( { name, backgroundColor: randomHexColor() } ) ) );
	}, [ length ] );

	return (
		<ListWrapper onChange={ handleOnSortEnd } withSortableKnob={ withKnobs }>
			{ map( items, ( { name, backgroundColor } ) => (
				<ListItem
					key={ name }
					align="center"
					justify="center"
					withKnobs={ withKnobs }
					style={ { backgroundColor } }
					isDark={ isDarkColor( backgroundColor ) }
				>
					{ name }
				</ListItem>
			) ) }
		</ListWrapper>
	);
}

const ListWrapper = styled( Sortable )`
	display: grid;
	grid-row-gap: 16px;
	grid-template-columns: 150px;
	grid-template-rows: auto;
`;
const ListItem = styled( Flex )`
	font-size: 20px;
	height: 50px;
	cursor: ${ ( props ) => ( props?.withKnobs ? 'auto' : 'grab' ) };
	color: ${ ( props ) => ( props?.isDark ? '#FFFFFF' : '#000000' ) };
`;

export default ListWithState;
