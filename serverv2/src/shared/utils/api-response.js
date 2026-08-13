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


export const paginatedResponse = ({
	res,
	data = [],
	meta,
	message = "Success",
	code = "SUCCESS",
	statusCode = 200
}) => {
	return res.status(statusCode).json({
		success: true,
		code,
		message,
		data,
		meta
	});
};