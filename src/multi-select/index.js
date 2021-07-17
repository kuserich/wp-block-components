/**
 * Utility for libraries from the `Lodash`.
 */
import { escapeRegExp, invoke, filter, map, indexOf, find, concat, merge, forEach, includes, isEqual } from 'lodash';

/**
 * Runtime type checking for React props and similar objects.
 */
import PropTypes from 'prop-types';

/**
 * Utility for conditionally joining CSS class names together.
 */
import classnames from 'classnames';

/**
 * Retrieves the translation of text.
 *
 * @see    https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * This packages includes a library of generic WordPress components to be used for
 * creating common UI elements shared between screens and features of the WordPress dashboard.
 *
 * @see    https://developer.wordpress.org/block-editor/reference-guides/packages/packages-components/
 */
import { TextControl, CheckboxControl } from '@wordpress/components';

/**
 * WordPress specific abstraction layer atop React.
 *
 * @see    https://github.com/WordPress/gutenberg/tree/HEAD/packages/element/README.md
 */
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';

/**
 * Collection of handy hooks and higher-order components (HOCs) to wrap WordPress
 * components and provide some basic features like state, instance id, and pure.
 *
 * @see    https://developer.wordpress.org/block-editor/reference-guides/packages/packages-compose
 */
import { useDebounce } from '@wordpress/compose';

/**
 * Utility helper methods specific for Sixa projects.
 */
import { removeAtIndex } from '@sixach/wp-block-utils';

/**
 * The styled components generated using @emotion/react API.
 *
 * @see    https://www.npmjs.com/package/@emotion/styled
 */
import { ComponentWrapper, OptionsWrapper, ClearButton } from './style';

/**
 * List of tags to display the selected options.
 */
import SelectedTagList from './selected-tag-list';

/**
 * Default messages for labels and notices.
 */
import defaultMessages from './messages';

/**
 * MultiSelect component designed to provide the ability to search for and select any number of options from
 * a set of { label, value } pairs in any order.
 *
 * Interface details:
 * MultiSelect expects a list of { label, value } pairs for the options that are displayed. Whenever an option
 * is selected or unselected, MultiSelect calls the `onChange` callback with the values of the selected options
 * only. That is, `selectedOptions` is an array of values only, not an array of { label, value } pairs.
 *
 * @function
 * @since	   1.3.0
 * 			   Added default props.
 *  		   Indented 4 spacing.
 * @since	   1.2.1
 * 			   Removed aria-description as being an invalid ARIA attribute.
 * 			   Intrdouce useDebounce hook from the compose package.
 * @since	   1.2.0
 * 			   Introduced type checking.
 * @since	   1.1.0
 * @param	   {Object}		    props                    The props that were defined by the caller of this component.
 * @param      {string}         props.className          The CSS class name(s) that will be added to the wrapper element.
 * @param	   {boolean} 	    props.withSearchField    Enable search field to filter options from the list.
 * @param	   {boolean} 	    props.withSelectAll    	 Enable `Select All` checkbox option.
 * @param	   {Array}		    props.options 			 Set of { label, value } pairs that can be selected.
 * @param	   {Array}		    props.selectedOptions    List of values of the options that are currently selected.
 * @param	   {string}		    props.aria			 	 Set of Aria attributes.
 * @param	   {Object} 		props.messages 			 Labels and notices for subcomponents. Is merged with a default value.
 * @param	   {Function}	    props.onChange 			 Callback function to be triggered when the selected options change.
 * @return     {JSX.Element}     						 MultiSelect component.
 * @example
 *
 * <MultiSelect
 * 		selectedOptions={ postIds }
 * 		options={ [{ value: 100, label: 'My blog post' }, { value: 108, label: 'My other blog post' }] }
 * 		onChange={ ( items ) => { setAttributes( { postIds: items } ); } }
 * />
 *
 * // => Array [ 100, 108 ]
 */
function MultiSelect( { className, withSearchField, withSelectAll, options, selectedOptions, aria, messages, onChange } ) {
	const [ searchText, setSearchText ] = useState( '' );
	const [ selected, setSelected ] = useState( [] );
	// Enable passing only a subset in `messages`.
	const mergedMessages = merge( {}, defaultMessages, messages );

	// Build options from selected ids. Allows us to persist order in which items are selected
	// and enables drag & drop support (for ordering) by moving the order logic into MultiSelect.
	// Without this, parent components would be required to pass `selectedOptions` in the correct
	// order, which may or may not introduce huge complexities depending on the data being passed.
	useEffect( () => {
		const updatedSelection = [];
		forEach( selectedOptions, ( value ) => {
			const option = find( options, [ 'value', value ] );
			if ( !! option ) {
				updatedSelection.push( option );
			}
		} );
		setSelected( updatedSelection );
	}, [ selectedOptions, options ] );

	const filteredOptions = useMemo( () => {
		// Bail early in case there is no search term entered.
		if ( ! Boolean( searchText.length ) ) {
			return options;
		}
		const pattern = new RegExp( escapeRegExp( searchText ), 'i' );
		return filter( options, ( { label } ) => invoke( label, 'match', pattern ) );
	}, [ searchText, options ] );

	const isOptionSelected = ( optionValue ) => includes( selectedOptions, optionValue );

	const areAllOptionsSelected = isEqual( selected.length, options.length );

	const handleOnChangeSearchText = useDebounce(
		useCallback( ( value ) => {
			setSearchText( value );
		}, [] ),
		500
	);

	const handleOnClickRemoveTag = ( optionIndex ) => {
		onChange( removeAtIndex( selectedOptions, optionIndex ) );
	};

	const handleOnChangeSelectAll = () => {
		if ( ! areAllOptionsSelected ) {
			onChange( map( options, ( { value } ) => value ) );
		} else {
			onChange( [] );
		}
	};

	const handleOnChangeOption = ( option ) => {
		const optionIndex = indexOf( selectedOptions, option );
		if ( -1 === optionIndex ) {
			onChange( concat( selectedOptions, option ) );
		} else {
			onChange( removeAtIndex( selectedOptions, optionIndex ) );
		}
	};

	const handleOnClickClearAll = () => {
		onChange( [] );
	};

	return (
		<ComponentWrapper
			className={ classnames( 'sixa-component-multiselect', className ) }
			aria={ {
				labelledby: aria?.labelledby,
				describedby: aria?.describedby,
			} }
		>
			<p>
				<strong>{ mergedMessages?.selected( selected.length ) }</strong>
				{ Boolean( selected.length ) && (
					<ClearButton
						isDestructive
						className="sixa-component-multiselect__clear-all-button"
						text={ __( 'Clear all', 'sixa' ) }
						onClick={ handleOnClickClearAll }
						aria-label={ __( 'Clear all selected items', 'sixa' ) }
					/>
				) }
			</p>
			{ Boolean( selected.length ) && <SelectedTagList items={ selected } onChange={ onChange } onRemove={ handleOnClickRemoveTag } /> }
			{ withSearchField && <TextControl label={ mergedMessages?.search } type="search" onChange={ handleOnChangeSearchText } /> }
			{ Boolean( searchText.length ) && ! Boolean( filteredOptions.length ) ? (
				<small>{ mergedMessages?.noResults }</small>
			) : (
				<OptionsWrapper className="sixa-component-multiselect__option-list">
					{ withSelectAll && ! Boolean( searchText.length ) && (
						<li>
							<CheckboxControl
								checked={ areAllOptionsSelected }
								onChange={ handleOnChangeSelectAll }
								/* translators: Number of options selected from list. */
								label={ sprintf( __( 'Select all (%d)', 'sixa' ), options.length ) }
							/>
						</li>
					) }
					{ map( filteredOptions, ( { value, label } ) => (
						<li key={ value }>
							<CheckboxControl checked={ isOptionSelected( value ) } onChange={ () => handleOnChangeOption( value ) } label={ label } />
						</li>
					) ) }
				</OptionsWrapper>
			) }
		</ComponentWrapper>
	);
}

MultiSelect.propTypes = {
	/**
	 * The CSS class name that will be appended to the wrapper div.
	 */
	className: PropTypes.string,
	/**
	 * Whether or not the search field should be displayed.
	 */
	withSearchField: PropTypes.bool,
	/**
	 * Whether or not an option for selecting all options should be displayed.
	 */
	withSelectAll: PropTypes.bool,
	/**
	 * An array of objects that can be chosen from.
	 */
	options: PropTypes.array.isRequired,
	/**
	 * List of values that are currently being selected.
	 */
	selectedOptions: PropTypes.array,
	/**
	 * Set of attributes that adds more context to the component to make it more accessible.
	 */
	aria: PropTypes.shape( {
		labelledby: PropTypes.string,
		describedby: PropTypes.string,
	} ),
	/**
	 * Labels and notices for subcomponents.
	 */
	messages: PropTypes.exact( {
		noResults: PropTypes.string,
		search: PropTypes.string,
		selected: PropTypes.func,
	} ),
	/**
	 * Callback function to be triggered when the selected options change.
	 */
	onChange: PropTypes.func.isRequired,
};

MultiSelect.defaultProps = {
	className: null,
	withSearchField: false,
	withSelectAll: false,
	options: undefined,
	selectedOptions: [],
	aria: {},
	messages: {},
	onChange: undefined,
};

export default MultiSelect;
