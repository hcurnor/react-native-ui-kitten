/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import {
  styled,
  StyledComponentProps,
  StyleType,
} from '@kitten/theme';
import {
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { CalendarHeader } from './components/calendarHeader.component';
import { CalendarMonthHeader } from './components/calendarMonthHeader.component';
import {
  CalendarPager,
  CalendarPagerElement,
} from './components/calendarPager.component';
import {
  CalendarPicker,
  CalendarPickerElement,
} from './components/picker/calendarPicker.component';
import { CalendarPickerCellProps } from './components/picker/calendarPickerCell.component';
import {
  CalendarDateContent,
  CalendarDateContentElement,
} from './components/calendarDateContent.component';
import {
  CalendarViewMode,
  CalendarViewModes,
} from './type';
import { DateService } from './service/date.service';
import { NativeDateService } from './service/nativeDate.service';
import { MonthModelService } from './service/monthModel.service';
import {
  batch,
  range,
} from './service/helpers';

interface ComponentProps<D> extends ViewProps {
  min?: D;
  max?: D;
  date?: D;
  dateService?: DateService<D>;
  boundingMonth?: boolean;
  startView?: CalendarViewMode;
  title?: (date: D, viewMode: CalendarViewMode) => string;
  todayTitle?: (date: D) => string;
  filter?: (date: D) => boolean;
  onSelect?: (date: D) => void;
  renderDay?: (date: D, style: StyleType) => React.ReactElement<any>;
  renderMonth?: (date: D, style: StyleType) => React.ReactElement<any>;
  renderYear?: (date: D, style: StyleType) => React.ReactElement<any>;
}

interface State<D> {
  viewMode: CalendarViewMode;
  visibleDate: D;
}

export type CalendarProps<D> = StyledComponentProps & ComponentProps<D>;
export type CalendarElement<D> = React.ReactElement<CalendarProps<D>>;

/**
 * Styled Calendar component.
 * Supports locales and different date objects like Moment.js or date-fns.
 * Composes date picker components in a horizontal pageable list.
 *
 * @extends React.Component
 *
 * @property {D} min - Minimal date that is able to be selected.
 *
 * @property {D} max - Maximum date that is able to be selected.
 *
 * @property {D} date - Date which is currently selected.
 *
 * @property {DateService<D>} dateService - Date service that is able to work with a date objects.
 * Defaults to Native Date service that works with JS Date.
 * Allows using different types of date like Moment.js or date-fns.
 *
 * @property {boolean} boundingMonth - Defines if we should render previous and next months in the current month view.
 *
 * @property {CalendarViewMode} startView - Defines starting view for calendar. Defaults to Date view.
 *
 * @property {(date: D) => string} title - Defines the title for visible date.
 *
 * @property {(date: D) => string} todayTitle - Defines the title for today's date.
 *
 * @property {(date: D) => ReactElement<any>} filter - Predicate that decides which cells will be disabled.
 *
 * @property {(date: D) => void} onSelect - Selection emitter. Fires when another day cell is pressed.
 *
 * @property {(date: D, style: StyleType) => ReactElement<any>} renderDay - Should return the content of day cell.
 *
 * @property {(date: D, style: StyleType) => ReactElement<any>} renderMonth - Should return the content of month cell.
 *
 * @property {(date: D, style: StyleType) => ReactElement<any>} renderYear - Should return the content of year cell.
 *
 * @example Basic Usage
 *
 * ```
 * import React from 'react';
 * import { Calendar } from 'react-native-ui-kitten';
 *
 * export class BasicCalendar extends React.Component {
 *
 *   state = {
 *     date: new Date(),
 *   };
 *
 *   onSelect = (date) => {
 *     this.setState({ date });
 *   };
 *
 *   render() {
 *     return (
 *       <Calendar
 *         date={this.state.date}
 *         onSelect={this.onSelect}
 *       />
 *     );
 *   }
 * }
 * ```
 *
 * @example Custom Day Cell
 *
 * ```
 * import React from 'react';
 * import { View, StyleSheet } from 'react-native';
 * import { Calendar, Text } from 'react-native-ui-kitten';
 *
 * export const DayCell = (date, style) => {
 *
 *   const styles = StyleSheet.create({
 *     container: {
 *       flex: 1,
 *       justifyContent: 'center',
 *       alignItems: 'center',
 *       aspectRatio: 1,
 *     },
 *     value: {
 *       fontSize: 12,
 *       fontWeight: 'normal',
 *     },
 *   });
 *
 *   const value: number = 100 * date.getDate() + Math.pow(date.getDate(), 2);
 *
 *   return (
 *     <View
 *       style={[styles.container, style.container]}>
 *       <Text style={style.text}>{`${date.getDate()}`}</Text>
 *       <Text style={[style.text, styles.value]}>{`${value}$`}</Text>
 *     </View>
 *   );
 * };
 *
 * export class DailyValueCalendar extends React.Component {
 *   render() {
 *     return (
 *       <Calendar renderDay={DayCell} />
 *     );
 *   }
 * }
 * ```
 *
 * @example Custom Locale
 *
 * ```
 * import React from 'react';
 * import { Calendar, NativeDateService } from 'react-native-ui-kitten';
 *
 * export class ChineseCalendar extends React.Component {
 *
 *   const i18n = {
 *     dayNames: {
 *       short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
 *       long: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
 *     },
 *     monthNames: {
 *       short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
 *       long: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
 *     },
 *   };
 *
 *   dateService = new DateService('zh', i18n);
 *
 *   render() {
 *     return (
 *       <Calendar dateService={this.dateService} />
 *     );
 *   }
 * }
 * ```
 *
 * @example Moment Date
 *
 * ```
 * import React from 'react';
 * import moment from 'moment';
 * import { Calendar } from 'react-native-ui-kitten';
 * import { MomentDateService } from '@ui-kitten/moment'; // <-- Assumes it is installed. npm install @ui-kitten/moment
 *
 * export class MomentCalendar extends React.Component {
 *
 *   state = {
 *     momentDate: moment();
 *   };
 *
 *   dateService = new MomentDateService();
 *
 *   onSelect = (momentDate) => {
 *     this.setState({ momentDate });
 *   }
 *
 *   render() {
 *     return (
 *       <Calendar
 *         date={this.state.date}
 *         onSelect={this.onSelect}
 *         dateService={this.dateService}
 *       />
 *     );
 *   }
 * }
 * ```
 */

export class CalendarComponent<D> extends React.Component<CalendarProps<D>, State<D>> {

  static styledComponentName: string = 'Calendar';

  static defaultProps = {
    dateService: new NativeDateService(),
    boundingMonth: false,
    startView: CalendarViewModes.DATE,
  };

  static MONTHS_IN_COLUMN: number = 4;
  static YEARS_IN_COLUMN: number = 4;
  static YEARS_IN_VIEW: number = 12;

  static FORMAT_DAY: string = 'D';
  static FORMAT_MONTH: string = 'MMM';
  static FORMAT_YEAR: string = 'YYYY';
  static FORMAT_HEADER_DATE: string = 'MMM YYYY';
  static FORMAT_HEADER_MONTH: string = 'YYYY';
  static FORMAT_HEADER_YEAR: string = 'YYYY';

  public state: State<D> = {
    viewMode: this.props.startView,
    visibleDate: this.dateService.getMonthStart(this.dateService.today()),
  };

  private monthService: MonthModelService<D> = new MonthModelService(this.dateService);

  private get dateService(): DateService<D> {
    return this.props.dateService;
  }

  private get min(): D {
    return this.props.min || this.dateService.getYearStart(this.dateService.today());
  }

  private get max(): D {
    return this.props.max || this.dateService.getYearEnd(this.dateService.today());
  }

  private get date(): D {
    return this.props.date || this.dateService.today();
  }

  private onDateSelect = (date: D) => {
    if (this.props.onSelect) {
      this.props.onSelect(date);
    }
  };

  private onMonthSelect = (date: D) => {
    const nextVisibleDate: D = this.dateService.createDate(
      this.dateService.getYear(this.state.visibleDate),
      this.dateService.getMonth(date),
      this.dateService.getDate(this.state.visibleDate),
    );

    this.setState({
      viewMode: this.state.viewMode.pickNext(),
      visibleDate: nextVisibleDate,
    });
  };

  private onYearSelect = (date: D) => {
    const nextVisibleDate: D = this.dateService.createDate(
      this.dateService.getYear(date),
      this.dateService.getMonth(this.state.visibleDate),
      this.dateService.getDate(this.state.visibleDate),
    );

    this.setState({
      viewMode: this.state.viewMode.pickNext(),
      visibleDate: nextVisibleDate,
    });
  };

  private onTodayPress = () => {
    this.setState({
      viewMode: CalendarViewModes.DATE,
      visibleDate: this.dateService.today(),
    });
  };

  private onPickerNavigationPress = () => {
    this.setState({
      viewMode: this.state.viewMode.navigationNext(),
    });
  };

  private shouldUpdateDayElement = (props: CalendarPickerCellProps<D>,
                                    nextProps: CalendarPickerCellProps<D>): boolean => {

    const dateChanged: boolean = this.dateService.compareDatesSafe(props.date, nextProps.date) !== 0;
    if (dateChanged) {
      return true;
    }

    const selectionChanged: boolean = props.selected !== nextProps.selected;
    const disablingChanged: boolean = props.disabled !== nextProps.disabled;

    if (selectionChanged || disablingChanged) {
      return true;
    }

    return props.theme !== nextProps.theme;
  };

  private getCalendarHeaderStyle = (source: StyleType): StyleType => {
    return {
      container: {
        paddingHorizontal: source.headerPaddingHorizontal,
        paddingVertical: source.headerPaddingVertical,
      },
      title: {
        fontSize: source.titleFontSize,
        fontWeight: source.titleFontWeight,
        lineHeight: source.titleLineHeight,
        marginHorizontal: source.titleMarginHorizontal,
        color: source.titleColor,
      },
      subtitle: {
        fontSize: source.subtitleFontSize,
        fontWeight: source.subtitleFontWeight,
        lineHeight: source.subtitleLineHeight,
        marginHorizontal: source.subtitleMarginHorizontal,
      },
    };
  };

  private getWeekdayStyle = (source: StyleType): StyleType => {
    return {
      fontSize: source.weekdayTextFontSize,
      fontWeight: source.weekdayTextFontWeight,
      lineHeight: source.weekdayTextLineHeight,
      color: source.weekdayTextColor,
    };
  };

  private isDaySelected = (date: D): boolean => {
    return this.dateService.isSameDaySafe(date, this.date);
  };

  private isMonthSelected = (date: D): boolean => {
    return this.dateService.isSameMonthSafe(date, this.date);
  };

  private isYearSelected = (date: D): boolean => {
    return this.dateService.isSameYearSafe(date, this.date);
  };

  private isDayDisabled = (date: D): boolean => {
    return !this.isDateFitsBounds(date) || this.isDateFitsFilter(date);
  };

  private isMonthDisabled = (date: D): boolean => {
    return !this.isDateFitsBounds(date) || this.isDateFitsFilter(date);
  };

  private isYearDisabled = (date: D): boolean => {
    return !this.isDateFitsBounds(date) || this.isDateFitsFilter(date);
  };

  private isDayToday = (date: D): boolean => {
    return this.dateService.isSameDaySafe(date, this.dateService.today());
  };

  private isMonthToday = (date: D): boolean => {
    return this.dateService.isSameMonthSafe(date, this.dateService.today());
  };

  private isYearToday = (date: D): boolean => {
    return this.dateService.isSameYearSafe(date, this.dateService.today());
  };

  private isDateFitsFilter = (date: D): boolean => {
    return this.props.filter && !this.props.filter(date) || false;
  };

  private isDateFitsBounds = (date: D): boolean => {
    return this.dateService.isBetweenIncludingSafe(date, this.min, this.max);
  };

  private isDayPickerInViewPort = (index: number): boolean => {
    const visibleDayPickerIndex: number = this.dateService.getMonth(this.state.visibleDate);

    return index === visibleDayPickerIndex || Math.abs(index - visibleDayPickerIndex) === 1;
  };

  private isYearPickerInViewPort = (index: number): boolean => {
    const numberOfYears: number = this.dateService.getYear(this.state.visibleDate) - this.dateService.getYear(this.min);
    const visibleYearPickerIndex: number = Math.floor(numberOfYears / CalendarComponent.YEARS_IN_VIEW);

    return index === visibleYearPickerIndex || Math.abs(index - visibleYearPickerIndex) === 1;
  };

  private createDayPickerData = (date: D): D[][] => {
    const monthStart: D = this.dateService.getMonthStart(date);

    return this.monthService.createDaysGrid(monthStart, this.props.boundingMonth);
  };

  private createMonthPickerData = (date: D): D[][] => {
    const yearStart: D = this.dateService.getYearStart(date);
    const monthRange: D[] = range(DateService.MONTHS_IN_YEAR, (index: number): D => {
      return this.dateService.addMonth(yearStart, index);
    });

    return batch(monthRange, CalendarComponent.MONTHS_IN_COLUMN);
  };

  private createYearPickerData = (date: D): D[][] => {
    const yearStart: D = this.dateService.getYearStart(date);
    const yearRange: D[] = range(CalendarComponent.YEARS_IN_VIEW, (index: number): D => {
      return this.dateService.addYear(yearStart, index);
    });

    return batch(yearRange, CalendarComponent.YEARS_IN_COLUMN);
  };

  private createDayPickerPagerData = (date: D): D[] => {
    const yearStart: D = this.dateService.getYearStart(date);

    return range(DateService.MONTHS_IN_YEAR, (index: number): D => {
      return this.dateService.addMonth(yearStart, index);
    });
  };

  private createYearPickerPagerData = (date: D): D[] => {
    const numberOfYears: number = this.dateService.getYear(this.max) - this.dateService.getYear(this.min);
    const numberOfYearPages: number = Math.max(numberOfYears / CalendarComponent.YEARS_IN_VIEW, 1);

    return range(numberOfYearPages, (index: number) => {
      return this.dateService.addYear(this.min, index * CalendarComponent.YEARS_IN_VIEW);
    });
  };

  private createHeaderTitle = (date: D, viewMode: CalendarViewMode): string => {
    switch (viewMode) {
      case CalendarViewModes.DATE:
        return this.dateService.format(date, CalendarComponent.FORMAT_HEADER_DATE);
      case CalendarViewModes.MONTH: {
        return this.dateService.format(date, CalendarComponent.FORMAT_HEADER_MONTH);
      }
      case CalendarViewModes.YEAR: {
        const endYear: D = this.dateService.addYear(this.max, CalendarComponent.YEARS_IN_VIEW);
        const isExceedsBound: boolean = this.dateService.compareDates(endYear, this.max) > 0;
        const maxDate: D = isExceedsBound ? endYear : this.max;

        const minDateFormat: string = this.dateService.format(this.min, CalendarComponent.FORMAT_HEADER_YEAR);
        const maxDateFormat: string = this.dateService.format(maxDate, CalendarComponent.FORMAT_HEADER_YEAR);

        return `${minDateFormat} - ${maxDateFormat}`;
      }
    }
  };

  private createTodayTitle = (date: D): string => {
    return 'Today';
  };

  private onDatePickerPagerSelect = (index: number) => {
    const yearStart: D = this.dateService.getYearStart(this.state.visibleDate);
    this.setState({
      visibleDate: this.dateService.addMonth(yearStart, index),
    });
  };

  private onYearPickerPagerSelect = (index: number) => {
    const yearStart: D = this.dateService.getYearStart(this.props.min);
    this.setState({
      visibleDate: this.dateService.addYear(yearStart, index * CalendarComponent.YEARS_IN_VIEW),
    });
  };

  private renderWeekdayElement = (weekday: string, index: number): CalendarDateContentElement => {
    return (
      <CalendarDateContent
        key={index}
        textStyle={this.getWeekdayStyle(this.props.themedStyle)}>
        {weekday}
      </CalendarDateContent>
    );
  };

  private renderDayElement = (date: any, style: StyleType): CalendarDateContentElement => {
    return (
      <CalendarDateContent
        style={[style.container, styles.dayCell]}
        textStyle={style.text}>
        {this.dateService.format(date, CalendarComponent.FORMAT_DAY)}
      </CalendarDateContent>
    );
  };

  private renderMonthElement = (date: any, style: StyleType): CalendarDateContentElement => {
    return (
      <CalendarDateContent
        style={[style.container, styles.monthCell]}
        textStyle={style.text}>
        {this.dateService.format(date, CalendarComponent.FORMAT_MONTH)}
      </CalendarDateContent>
    );
  };

  private renderYearElement = (date: any, style: StyleType): CalendarDateContentElement => {
    return (
      <CalendarDateContent
        style={[style.container, styles.yearCell]}
        textStyle={style.text}>
        {this.dateService.format(date, CalendarComponent.FORMAT_YEAR)}
      </CalendarDateContent>
    );
  };

  private renderDatePickerElement = (date: D, index: number): CalendarPickerElement<D> => {
    return (
      <CalendarPicker
        key={index}
        data={this.createDayPickerData(date)}
        onSelect={this.onDateSelect}
        isItemSelected={this.isDaySelected}
        isItemDisabled={this.isDayDisabled}
        isItemToday={this.isDayToday}
        shouldItemUpdate={this.shouldUpdateDayElement}
        renderItem={this.props.renderDay || this.renderDayElement}
      />
    );
  };

  private renderDayPickerPagerElement = (date: D): React.ReactElement<ViewProps> => {
    const visibleDayPickerIndex: number = this.dateService.getMonth(this.state.visibleDate);

    return (
      <React.Fragment>
        <CalendarMonthHeader data={this.dateService.getDayOfWeekNames()}>
          {this.renderWeekdayElement}
        </CalendarMonthHeader>
        <CalendarPager
          selectedIndex={visibleDayPickerIndex}
          data={this.createDayPickerPagerData(date)}
          onSelect={this.onDatePickerPagerSelect}
          shouldLoadComponent={this.isDayPickerInViewPort}>
          {this.renderDatePickerElement}
        </CalendarPager>
      </React.Fragment>
    );
  };

  private renderMonthPickerElement = (date: D): CalendarPagerElement<D> => {
    return (
      <CalendarPicker
        data={this.createMonthPickerData(date)}
        onSelect={this.onMonthSelect}
        isItemSelected={this.isMonthSelected}
        isItemDisabled={this.isMonthDisabled}
        isItemToday={this.isMonthToday}
        renderItem={this.props.renderMonth || this.renderMonthElement}
      />
    );
  };

  private renderYearPickerElement = (date: D, index: number): React.ReactElement<ViewProps> => {
    return (
      <CalendarPicker
        key={index}
        data={this.createYearPickerData(date)}
        onSelect={this.onYearSelect}
        isItemSelected={this.isYearSelected}
        isItemDisabled={this.isYearDisabled}
        isItemToday={this.isYearToday}
        renderItem={this.props.renderYear || this.renderYearElement}
      />
    );
  };

  private renderYearPickerPagerElement = (date: D): CalendarPagerElement<D> => {
    const numberOfYears: number = this.dateService.getYear(this.state.visibleDate) - this.dateService.getYear(this.min);
    const visibleYearPickerIndex: number = Math.floor(numberOfYears / CalendarComponent.YEARS_IN_VIEW);

    return (
      <CalendarPager
        selectedIndex={visibleYearPickerIndex}
        data={this.createYearPickerPagerData(date)}
        onSelect={this.onYearPickerPagerSelect}
        shouldLoadComponent={this.isYearPickerInViewPort}>
        {this.renderYearPickerElement}
      </CalendarPager>
    );
  };

  private renderPickerElement = (date: D): React.ReactElement<ViewProps> => {
    switch (this.state.viewMode.id) {
      case CalendarViewModes.DATE.id:
        return this.renderDayPickerPagerElement(date);
      case CalendarViewModes.MONTH.id:
        return this.renderMonthPickerElement(date);
      case CalendarViewModes.YEAR.id:
        return this.renderYearPickerPagerElement(date);
    }
  };

  public render(): React.ReactElement<ViewProps> {
    const { style, themedStyle, title, todayTitle, ...restProps } = this.props;
    const headerStyle: StyleType = this.getCalendarHeaderStyle(themedStyle);

    const titleSelector = title || this.createHeaderTitle;
    const todayTitleSelector = todayTitle || this.createTodayTitle;

    return (
      <View
        {...restProps}
        style={[styles.container, style]}>
        <CalendarHeader
          style={headerStyle.container}
          titleStyle={headerStyle.title}
          subtitleStyle={headerStyle.subtitle}
          title={titleSelector(this.state.visibleDate, this.state.viewMode)}
          subtitle={todayTitleSelector(this.dateService.today())}
          onTitlePress={this.onPickerNavigationPress}
          onSubtitlePress={this.onTodayPress}
        />
        {this.renderPickerElement(this.state.visibleDate)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  dayCell: {
    aspectRatio: 1,
  },
  monthCell: {
    aspectRatio: 0.25 * DateService.DAYS_IN_WEEK,
  },
  yearCell: {
    aspectRatio: 0.25 * DateService.DAYS_IN_WEEK,
  },
});

export const Calendar = styled(CalendarComponent);
