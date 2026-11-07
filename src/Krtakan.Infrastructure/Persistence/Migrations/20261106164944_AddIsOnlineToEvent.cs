using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krtakan.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsOnlineToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOnline",
                table: "Events",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOnline",
                table: "Events");
        }
    }
}
