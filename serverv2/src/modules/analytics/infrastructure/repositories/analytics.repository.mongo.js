import DailyAnalytics from "../database/mongoose/daily-analytics.model.js";
import WeeklyAnalytics from "../database/mongoose/weekly-analytics.model.js";
import MonthlyAnalytics from "../database/mongoose/monthly-analytics.model.js";

export default class AnalyticsRepositoryMongo {

    // ---------------- DAILY ----------------
    async upsertDaily(date, data) {
        return DailyAnalytics.findOneAndUpdate(
            { date },
            { $inc: data },
            { upsert: true, returnDocument: 'after' } // ✅ updated
        );
    }

    async getDailyByDate(date) {
        return DailyAnalytics.findOne({ date });
    }

    async getDailyRange(startDate, endDate) {
        return DailyAnalytics.find({
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
    }

    // ---------------- WEEKLY ----------------
    async upsertWeekly(week, data) {
        return WeeklyAnalytics.findOneAndUpdate(
            { week },
            { $inc: data },
            { upsert: true, returnDocument: 'after' } // ✅ updated
        );
    }

    async getWeeklyRange(startWeek, endWeek) {
        return WeeklyAnalytics.find({
            week: { $gte: startWeek, $lte: endWeek }
        }).sort({ week: 1 });
    }

    // ---------------- MONTHLY ----------------
    async upsertMonthly(month, data) {
        return MonthlyAnalytics.findOneAndUpdate(
            { month },
            { $inc: data },
            { upsert: true, returnDocument: 'after' } // ✅ updated
        );
    }

    async getMonthlyRange(startMonth, endMonth) {
        return MonthlyAnalytics.find({
            month: { $gte: startMonth, $lte: endMonth }
        }).sort({ month: 1 });
    }

    // ---------------- DASHBOARD ----------------
    async getOverview() {
        const [daily, monthly] = await Promise.all([
            DailyAnalytics.find().sort({ date: -1 }).limit(7),
            MonthlyAnalytics.find().sort({ month: -1 }).limit(6)
        ]);

        return {
            last7Days: daily,
            last6Months: monthly
        };
    }
}