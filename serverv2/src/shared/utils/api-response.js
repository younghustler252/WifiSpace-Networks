export const successResponse = ({
	res,
	data = null,
	message = "Success",
	code = "SUCCESS",
	statusCode = 200
}) => {
	return res.status(statusCode).json({
		success: true,
		code,
		message,
		data
	});
};