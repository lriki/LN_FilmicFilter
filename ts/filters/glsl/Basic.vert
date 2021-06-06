

attribute vec2 aVertexPosition;
//uniform mat3 projectionMatrix;
varying vec2 vTextureCoord;
uniform vec4 inputSize;
uniform vec4 outputFrame;
/*
vec4 filterVertexPosition(void) {
vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}
*/

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
gl_Position = vec4(aVertexPosition * vec2(2.0) + vec2(-1.0, -1.0), 0.0, 1.0);//filterVertexPosition();
vTextureCoord = filterTextureCoord();
}

/*
aVertexPosition をそのまま出力すると、画面右下に赤の矩形が出る。

 */


/*
attribute vec2 aVertexPosition;
uniform mat3 projectionMatrix;
varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = vTextureCoord;
}

*/