import json
import re
from typing import Any, Dict, List, Union

class ChartConverter:
    """
    Utility class to convert chart.json data to slide.json format
    with proper handling of JavaScript functions and ECharts configurations
    """
    
    def __init__(self):
        self.js_function_pattern = re.compile(r'"__js_function__"\s*:\s*true')
    
    def to_native(self, obj: Any) -> Any:
        """
        Convert PyScript/JsProxy objects to native Python objects
        """
        try:
            # Handle JsProxy objects
            if hasattr(obj, 'to_py'):
                obj = obj.to_py()
            
            # Handle dictionaries
            if isinstance(obj, dict):
                result = {}
                for key, value in obj.items():
                    try:
                        native_key = self.to_native(key)
                        native_value = self.to_native(value)
                        result[native_key] = native_value
                    except Exception as e:
                        print(f"Warning: Failed to convert key-value pair {key}: {e}")
                        # Fallback: convert to string
                        result[str(key)] = str(value) if value is not None else None
                return result
            
            # Handle lists/arrays
            elif isinstance(obj, (list, tuple)):
                result = []
                for item in obj:
                    try:
                        result.append(self.to_native(item))
                    except Exception as e:
                        print(f"Warning: Failed to convert list item: {e}")
                        result.append(str(item) if item is not None else None)
                return result
            
            # Handle primitive types
            elif isinstance(obj, (str, int, float, bool)) or obj is None:
                return obj
            
            # Fallback for unknown types
            else:
                try:
                    return str(obj)
                except Exception:
                    return None
                    
        except Exception as e:
            print(f"Error in to_native conversion: {e}")
            return str(obj) if obj is not None else None
    
    def process_js_functions(self, obj: Any) -> Any:
        """
        Process JavaScript functions in the chart configuration
        """
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                if (isinstance(value, dict) and 
                    value.get('__js_function__') is True and 
                    'value' in value):
                    # Keep the JavaScript function structure for frontend processing
                    result[key] = {
                        '__js_function__': True,
                        'value': self.clean_js_function(value['value'])
                    }
                else:
                    result[key] = self.process_js_functions(value)
            return result
        elif isinstance(obj, list):
            return [self.process_js_functions(item) for item in obj]
        else:
            return obj
    
    def clean_js_function(self, js_code: str) -> str:
        """
        Clean and format JavaScript function code
        """
        if not isinstance(js_code, str):
            return str(js_code)
        
        # Remove extra escaping
        cleaned = js_code.replace('\\n', '\n').replace('\\"', '"').replace("\\'", "'")
        
        # Remove leading/trailing whitespace
        cleaned = cleaned.strip()
        
        return cleaned
    
    def is_echarts_config(self, obj: Dict) -> bool:
        """
        Check if the object is a direct ECharts configuration
        """
        if not isinstance(obj, dict):
            return False
        
        # Common ECharts configuration properties
        echarts_props = [
            'title', 'legend', 'grid', 'xAxis', 'yAxis', 'series',
            'tooltip', 'backgroundColor', 'color', 'graphic'
        ]
        
        # Check if at least 2 ECharts properties are present
        found_props = sum(1 for prop in echarts_props if prop in obj)
        return found_props >= 2
    
    def convert_chart_to_slide_format(self, chart_data: Dict) -> Dict:
        """
        Convert chart.json format to slide.json widget format
        """
        try:
            # Extract widget information
            widget = {
                'widget_type': 'chart',
                'widget_name': chart_data.get('widget_name', 'Chart'),
                'output_type': chart_data.get('output_type', 'chart'),
                'data': chart_data.get('data', {}),
                'widget_code': self.process_js_functions(chart_data.get('widget_code', {}))
            }
            
            return widget
            
        except Exception as e:
            print(f"Error converting chart to slide format: {e}")
            return {
                'widget_type': 'chart',
                'widget_name': 'Error Chart',
                'output_type': 'chart',
                'data': {},
                'widget_code': {}
            }
    
    def create_slide_from_chart(self, chart_data: Dict, slide_id: str = None) -> Dict:
        """
        Create a complete slide object from chart data
        """
        widget = self.convert_chart_to_slide_format(chart_data)
        
        slide = {
            'id': slide_id or f"slide_{chart_data.get('widget_name', 'chart')}",
            'title': chart_data.get('widget_name', 'Chart Slide'),
            'subtitle': f"Generated from {chart_data.get('output_type', 'chart')}",
            'content': '',
            'style': {
                'bgColor': '#ffffff',
                'textColor': '#000000',
                'align': 'center'
            },
            'widget': widget
        }
        
        return slide
    
    def convert_chart_json_to_slides(self, chart_json_path: str, output_path: str = None) -> Dict:
        """
        Convert entire chart.json file to slide.json format
        """
        try:
            # Load chart.json
            with open(chart_json_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
            
            # Convert to native Python objects
            chart_data = self.to_native(raw_data)
            
            # Check if this is a direct ECharts configuration
            if self.is_echarts_config(chart_data):
                # Create a widget directly from ECharts config
                widget = {
                    'widget_type': 'chart',
                    'widget_name': 'ECharts Visualization',
                    'output_type': 'chart',
                    'data': {},
                    'widget_code': self.process_js_functions(chart_data)
                }
                
                slide = {
                    'id': 'slide_1',
                    'title': 'Chart Visualization',
                    'subtitle': 'Generated from ECharts configuration',
                    'content': '',
                    'style': {
                        'bgColor': '#ffffff',
                        'textColor': '#000000',
                        'align': 'center'
                    },
                    'widget': widget
                }
                
                slides = [slide]
            
            # Handle array format (multiple charts)
            elif isinstance(chart_data, list):
                slides = []
                for i, chart in enumerate(chart_data):
                    if chart.get('success', True):  # Only process successful charts
                        slide = self.create_slide_from_chart(chart, f"slide_{i+1}")
                        slides.append(slide)
            
            # Handle single chart object
            else:
                slide = self.create_slide_from_chart(chart_data, "slide_1")
                slides = [slide]
            
            # Create slide.json structure
            slide_data = {
                'slide_data': {
                    'slides': slides
                }
            }
            
            # Save to file if output path provided
            if output_path:
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(slide_data, f, indent=2, ensure_ascii=False)
                print(f"Converted {len(slides)} slides saved to {output_path}")
            
            return slide_data
            
        except Exception as e:
            print(f"Error converting chart.json to slides: {e}")
            return {'slide_data': {'slides': []}}
    
    def validate_slide_data(self, slide_data: Dict) -> bool:
        """
        Validate the converted slide data structure
        """
        try:
            if 'slide_data' not in slide_data:
                return False
            
            if 'slides' not in slide_data['slide_data']:
                return False
            
            slides = slide_data['slide_data']['slides']
            if not isinstance(slides, list):
                return False
            
            for slide in slides:
                required_fields = ['id', 'title', 'style', 'widget']
                if not all(field in slide for field in required_fields):
                    return False
                
                widget = slide['widget']
                if 'widget_type' not in widget:
                    return False
            
            return True
            
        except Exception:
            return False

# Example usage
if __name__ == "__main__":
    converter = ChartConverter()
    
    # Convert chart.json to slide format
    try:
        slide_data = converter.convert_chart_json_to_slides(
            'chart.json', 
            'converted_slides.json'
        )
        
        # Validate the result
        if converter.validate_slide_data(slide_data):
            print("✅ Conversion successful and validated!")
        else:
            print("❌ Conversion completed but validation failed")
            
    except Exception as e:
        print(f"❌ Conversion failed: {e}")